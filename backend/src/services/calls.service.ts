import {
  CallCenterData,
  CallCenterStats,
  CombinedActivityItem,
} from "../types/callcenter.types";
import { ZendeskService, CallCenterReport } from "./zendesk.service";
import { PDFParserService } from "./pdf-parser.service";

export class CallService {
  private zendeskService: ZendeskService;
  private pdfParserService: PDFParserService;
  private cachedData: CallCenterData | null = null;
  private lastFetchTime: Date | null = null;
  // Remove fixed duration - we'll use end of day instead
  // private CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.zendeskService = new ZendeskService();
    this.pdfParserService = new PDFParserService();
  }

  // Get all calls (basic implementation for the original endpoint)
  async getAllCalls(): Promise<any[]> {
    // If you need to return regular calls, implement here
    // For now, return empty array
    return [];
  }

  async getCallCenterStats(): Promise<CallCenterData> {
    // Check if we need to refresh the cache
    if (!this.cachedData || !this.lastFetchTime || this.isCacheExpired()) {
      await this.fetchAndProcessReports();
    }

    return this.cachedData!;
  }

  // Check if cache has expired (end of day)
  private isCacheExpired(): boolean {
    if (!this.lastFetchTime) return true;

    const now = new Date();
    const lastFetch = new Date(this.lastFetchTime);

    // If we're on a different day, the cache is expired
    if (
      now.getDate() !== lastFetch.getDate() ||
      now.getMonth() !== lastFetch.getMonth() ||
      now.getFullYear() !== lastFetch.getFullYear()
    ) {
      return true;
    }

    // Cache expires at end of business day (e.g., 17:00/5 PM)
    const cacheExpiryTime = new Date(lastFetch);
    cacheExpiryTime.setHours(17, 0, 0, 0); // Set to 5 PM

    // If last fetch was before today's expiry time and we're past it, cache is expired
    if (lastFetch < cacheExpiryTime && now >= cacheExpiryTime) {
      return true;
    }

    return false;
  }

  private async fetchAndProcessReports(): Promise<void> {
    try {
      // Fetch ALL reports from Zendesk without date restriction
      const reports = await this.zendeskService.getCallCenterReports();

      if (reports.length === 0) {
        throw new Error("No call center reports found");
      }

      // Use a Map to deduplicate by date and time
      const uniqueCallData = new Map<string, CombinedActivityItem>();

      // Process each PDF report
      for (const { ticket, pdfBuffer, fileName } of reports) {
        console.log(`Processing report: ${fileName}`);
        const callData = await this.pdfParserService.parseCallCenterReport(
          pdfBuffer
        );

        // Deduplicate by date+time key
        callData.forEach((item) => {
          const key = `${item.date}_${item.time}`;
          // If we already have data for this date/time, we'll use the newer report's data
          if (
            !uniqueCallData.has(key) ||
            this.isNewerReport(fileName, uniqueCallData.get(key)!)
          ) {
            uniqueCallData.set(key, item);
          }
        });
      }

      const allCallData = Array.from(uniqueCallData.values());

      // Sort all data by date and time
      allCallData.sort((a, b) => {
        const dateA = this.parseDateTime(a.date, a.time);
        const dateB = this.parseDateTime(b.date, b.time);
        return dateA.getTime() - dateB.getTime();
      });

      // Aggregate and transform the data
      this.cachedData = this.transformCallData(allCallData);
      this.lastFetchTime = new Date();
    } catch (error) {
      console.error("Error fetching and processing reports:", error);
      throw error;
    }
  }

  private transformCallData(callData: CombinedActivityItem[]): CallCenterData {
    // Calculate basic metrics
    const totalCalls = callData.reduce((sum, item) => sum + item.queued, 0);
    
    const answeredCalls = callData.reduce(
      (sum, item) => sum + item.answered,
      0
    );
    const abandonedCalls = callData.reduce(
      (sum, item) => sum + item.abandoned,
      0
    );
    const presentedCalls = callData.reduce(
      (sum, item) => sum + item.presented,
      0
    );
    const answeredIn60Secs = callData.reduce(
      (sum, item) => sum + item.answeredIn60Secs,
      0
    );

    const bouncedCalls = callData.reduce(
      (sum, item) => sum + item.bounced,
      0
    );

    const callCenterStats: CallCenterStats = {
      total: totalCalls,
      answered: answeredCalls,
      abandoned: abandonedCalls,
      presented: presentedCalls,
      bounced: bouncedCalls,
      answeredIn60Secs: answeredIn60Secs,
      percentAnswered:
        presentedCalls > 0
          ? Math.round((answeredCalls / presentedCalls) * 100)
          : 0,
      percentAbandoned:
        presentedCalls > 0
          ? Math.round((abandonedCalls / presentedCalls) * 100)
          : 0,
      percentBounced:
        presentedCalls > 0
          ? Math.round((bouncedCalls / presentedCalls) * 100)
          : 0,
      percentAnsweredIn60Secs:
        presentedCalls > 0
          ? Math.round((answeredIn60Secs / presentedCalls) * 100)
          : 0,
      percentAnsweredIn60SecsOfAnswered:
        answeredCalls > 0
          ? Math.round((answeredIn60Secs / answeredCalls) * 100)
          : 0,
      longestWaitTime: this.getMaxTime(callData, "longestWait"),
      longestAnswerTime: this.getMaxTime(callData, "longestAnswer"),
      longestWaitAbandoned: this.getMaxTime(callData, "longestAbandoned"),
      avgWaitTime: this.calculateAverageTime(callData, "longestWait"),
      avgTalkTime: this.calculateAverageTime(callData, "longestAnswer"),
      avgTaskTime: this.calculateAverageTime(callData, "longestAnswer"), // For now, same as talk time
      avgQueueTime: this.calculateAverageTime(callData, "longestWait"),
      callsPerHour: this.calculateCallsPerHour(callData),
    };

    // Add additional data expected by frontend
    const weeklyActivity = this.generateWeeklyActivity(callData);
    const responseRateTrend = this.generateResponseRateTrend(callData);
    const heatmapData = this.generateHeatmapData(callData);

    return {
      callCenterStats,
      combinedActivityData: callData,
      reportDateRange: this.getDateRange(callData),
      companyName: "Sundk callcenter",
      weeklyCallActivity: weeklyActivity,
      responseRateTrend: responseRateTrend,
      callHeatmapData: heatmapData,
    };
  }

  // Helper method to parse date/time strings
  private parseDateTime(dateStr: string, timeStr: string): Date {
    const [day, month, year] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  // Helper method to determine if one report is newer than another
  private isNewerReport(
    fileName: string,
    existingItem: CombinedActivityItem
  ): boolean {
    // Extract date from filename (callCenterReport_YYMMDD_HHMMSS.pdf)
    const match = fileName.match(/callCenterReport_(\d{6})_(\d{6})\.pdf/);
    if (!match) return false;

    const fileDate = match[1];
    const fileTime = match[2];

    // Convert to comparable format
    const year = 2000 + parseInt(fileDate.substring(0, 2));
    const month = parseInt(fileDate.substring(2, 4));
    const day = parseInt(fileDate.substring(4, 6));
    const hour = parseInt(fileTime.substring(0, 2));
    const minute = parseInt(fileTime.substring(2, 4));
    const second = parseInt(fileTime.substring(4, 6));

    const fileDateTime = new Date(year, month - 1, day, hour, minute, second);
    const existingDateTime = this.parseDateTime(
      existingItem.date,
      existingItem.time
    );

    return fileDateTime > existingDateTime;
  }

  // Calculate calls per hour more accurately
  private calculateCallsPerHour(callData: CombinedActivityItem[]): number {
    if (callData.length === 0) return 0;

    // Group calls by date and hour
    const hourlyData = new Map<string, number>();

    callData.forEach((item) => {
      const key = `${item.date}_${item.time.split(":")[0]}`;
      if (!hourlyData.has(key)) {
        hourlyData.set(key, 0);
      }
      hourlyData.set(key, hourlyData.get(key)! + item.queued);
    });

    // Calculate average calls per hour
    const totalHours = hourlyData.size;
    const totalCalls = callData.reduce((sum, item) => sum + item.queued, 0);

    return totalHours > 0 ? Math.round(totalCalls / totalHours) : 0;
  }

  // Generate weekly activity data
  private generateWeeklyActivity(data: CombinedActivityItem[]): any[] {
    const weekDays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
    const activity = weekDays.map((day) => ({
      name: day,
      besvaret: 0,
      ubesvaret: 0,
    }));

    // Process data to fill in weekly activity
    data.forEach((item) => {
      const date = this.parseDateTime(item.date, item.time);
      const dayOfWeek = (date.getDay() + 6) % 7; // Convert Sunday from 0 to 6

      activity[dayOfWeek].besvaret += item.answered;
      activity[dayOfWeek].ubesvaret += item.abandoned;
    });

    return activity;
  }

  // Generate response rate trend data
  private generateResponseRateTrend(data: CombinedActivityItem[]): any[] {
    // Group by date and calculate percentages
    const dateMap = new Map();

    data.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, {
          date: item.date,
          answered: 0,
          total: 0,
          answeredIn60: 0,
          abandoned: 0,
        });
      }

      const dayData = dateMap.get(item.date);
      dayData.answered += item.answered;
      dayData.total += item.queued;
      dayData.answeredIn60 += item.answeredIn60Secs;
      dayData.abandoned += item.abandoned;
    });

    // Convert to trend data
    const trend: any[] = [];
    Array.from(dateMap.values()).forEach((day) => {
      trend.push({
        day: day.date,
        besvaret: day.total > 0 ? (day.answered / day.total) * 100 : 0,
        ubesvaret: day.total > 0 ? (day.abandoned / day.total) * 100 : 0,
        besvaret60: day.total > 0 ? (day.answeredIn60 / day.total) * 100 : 0,
      });
    });

    // Sort by date
    trend.sort((a, b) => {
      const dateA = this.parseDateTime(a.day, "00:00");
      const dateB = this.parseDateTime(b.day, "00:00");
      return dateA.getTime() - dateB.getTime();
    });

    return trend.slice(-7); // Return last 7 days
  }

  // Generate heatmap data
  private generateHeatmapData(data: CombinedActivityItem[]): any[] {
    const heatmapData: any[] = [];

    data.forEach((item) => {
      const date = this.parseDateTime(item.date, item.time);
      const dayOfWeek = (date.getDay() + 6) % 7; // Convert Sunday from 0 to 6
      const hour = parseInt(item.time.split(":")[0]);

      // Only include weekdays (Mon-Fri) and business hours (8-15)
      if (dayOfWeek < 5 && hour >= 8 && hour < 16) {
        heatmapData.push([
          hour,
          dayOfWeek,
          item.queued,
          item.date,
          item.answered,
        ]);
      }
    });

    return heatmapData;
  }

  // Helper methods for calculations
  private getMaxTime(
    data: CombinedActivityItem[],
    field: keyof CombinedActivityItem
  ): string {
    if (data.length === 0) return "00:00:00";

    let maxSeconds = 0;
    data.forEach((item) => {
      const timeString = item[field] as string;
      if (timeString && typeof timeString === "string") {
        const seconds = this.timeStringToSeconds(timeString);
        if (seconds > maxSeconds) maxSeconds = seconds;
      }
    });

    return this.secondsToTimeString(maxSeconds);
  }

  private calculateAverageTime(
    data: CombinedActivityItem[],
    field: keyof CombinedActivityItem
  ): string {
    if (data.length === 0) return "00:00:00";

    let totalSeconds = 0;
    let count = 0;

    data.forEach((item) => {
      const timeString = item[field] as string;
      if (
        timeString &&
        typeof timeString === "string" &&
        timeString !== "00:00:00"
      ) {
        totalSeconds += this.timeStringToSeconds(timeString);
        count++;
      }
    });

    const avgSeconds = count > 0 ? Math.round(totalSeconds / count) : 0;
    return this.secondsToTimeString(avgSeconds);
  }

  private timeStringToSeconds(timeString: string): number {
    if (!timeString || timeString === "00:00:00") return 0;
    const parts = timeString.split(":").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return 0;
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  private secondsToTimeString(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  private getDateRange(data: CombinedActivityItem[]): string {
    if (data.length === 0) return "";

    const dates = data.map((item) => this.parseDateTime(item.date, item.time));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  }

  // Method to manually trigger a refresh - clears cache
  async refreshCallData(): Promise<void> {
    // Clear cache to force refresh
    this.cachedData = null;
    this.lastFetchTime = null;
    await this.fetchAndProcessReports();
  }

  // Additional methods for the original calls endpoints
  async getCallById(id: string): Promise<any | undefined> {
    // Implement if needed
    return undefined;
  }

  async createCall(callData: any): Promise<any> {
    // Implement if needed
    return {};
  }

  async updateCall(id: string, callData: any): Promise<any | undefined> {
    // Implement if needed
    return undefined;
  }

  async deleteCall(id: string): Promise<boolean> {
    // Implement if needed
    return false;
  }
}
