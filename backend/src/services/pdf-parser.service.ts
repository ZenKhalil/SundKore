import PDFParser from "pdf2json";
import { CombinedActivityItem } from "../types/callcenter.types";

export class PDFParserService {
  async parseCallCenterReport(
    pdfBuffer: Buffer
  ): Promise<CombinedActivityItem[]> {
    return new Promise((resolve, reject) => {
      const pdfParser = new (PDFParser as any)();

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF parsing error:", errData);
        reject(errData);
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          const items = this.extractTableData(pdfData);
          resolve(items);
        } catch (error) {
          console.error("Error extracting table data:", error);
          reject(error);
        }
      });

      // Parse the buffer
      pdfParser.parseBuffer(pdfBuffer);
    });
  }

  private extractTableData(pdfData: any): CombinedActivityItem[] {
    console.log("PDF structure:", JSON.stringify(pdfData, null, 2));
    const items: CombinedActivityItem[] = [];

    // pdf2json provides data in Pages array
    if (!pdfData.Pages || pdfData.Pages.length === 0) {
      console.log("No pages found in PDF");
      return items;
    }

    // Look through all pages
    for (let pageIndex = 0; pageIndex < pdfData.Pages.length; pageIndex++) {
      const page = pdfData.Pages[pageIndex];

      // Get all text elements on the page
      const texts = page.Texts || [];

      // Find the Call Center Activity table
      let activityTable: any[] = [];
      let watermarkTable: any[] = [];
      let inActivityTable = false;
      let inWatermarkTable = false;

      for (let i = 0; i < texts.length; i++) {
        const text = decodeURIComponent(texts[i].R[0].T);

        // Check for table headers
        if (text.includes("Call Center Activity") && i + 1 < texts.length) {
          const nextText = decodeURIComponent(texts[i + 1].R[0].T);
          if (nextText.includes("Date and Time")) {
            inActivityTable = true;
            inWatermarkTable = false;
            continue;
          }
        }

        if (text.includes("High Water Marks") && i + 1 < texts.length) {
          const nextText = decodeURIComponent(texts[i + 1].R[0].T);
          if (nextText.includes("Date and Time")) {
            inActivityTable = false;
            inWatermarkTable = true;
            continue;
          }
        }

        if (text.includes("Report Summary")) {
          inActivityTable = false;
          inWatermarkTable = false;
          continue;
        }

        // Collect data based on position
        if (inActivityTable && text.match(/^\d{2}-\d{2}-\d{4}/)) {
          // This is a data row - collect all texts in the same Y position
          const y = texts[i].y;
          const rowData: any[] = [];

          // Find all text elements on the same row (similar Y coordinate)
          for (let j = i; j < texts.length; j++) {
            if (Math.abs(texts[j].y - y) < 0.5) {
              rowData.push({
                text: decodeURIComponent(texts[j].R[0].T),
                x: texts[j].x,
              });
            }
          }

          // Sort by X position to get the correct column order
          rowData.sort((a, b) => a.x - b.x);
          activityTable.push(rowData.map((item) => item.text));
        }

        if (inWatermarkTable && text.match(/^\d{2}-\d{2}-\d{2}/)) {
          // Similar logic for watermark table
          const y = texts[i].y;
          const rowData: any[] = [];

          for (let j = i; j < texts.length; j++) {
            if (Math.abs(texts[j].y - y) < 0.5) {
              rowData.push({
                text: decodeURIComponent(texts[j].R[0].T),
                x: texts[j].x,
              });
            }
          }

          rowData.sort((a, b) => a.x - b.x);
          watermarkTable.push(rowData.map((item) => item.text));
        }
      }

      // Process the activity table
      console.log(`Found ${activityTable.length} rows in activity table`);

      for (const row of activityTable) {
        // Debug row structure to ensure we're accessing the right indices
        console.log("Row data:", row);

        if (row.length < 11) {
          console.log("Row too short, skipping:", row);
          continue; // Skip rows that don't have enough columns
        }

        // Extract date and time
        const dateTime = row[0];
        const [date, time] = dateTime.split(",").map((s: string) => s.trim());

        // Parse the values from the correct columns
        // Based on the table structure:
        // [0] = Date and Time
        // [1] = Call Center Name
        // [2] = Calls Queued
        // [3] = Calls Escaped
        // [4] = Calls Abandoned
        // [5] = Calls Presented
        // [6] = Calls Answered
        // [7] = Calls Answered In 60 secs
        // [10] = Calls Bounced (verified from your table)

        const item: CombinedActivityItem = {
          date,
          time,
          queued: parseInt(row[2]) || 0,
          presented: parseInt(row[5]) || 0,
          answered: parseInt(row[6]) || 0,
          answeredIn60Secs: parseInt(row[7]) || 0,
          abandoned: parseInt(row[4]) || 0,
          bounced: parseInt(row[11]) || 0, 
          longestWait: "00:00:00",
          longestAnswer: "00:00:00",
          longestAbandoned: "00:00:00",
          percentAnswered: 0,
        };

        // Log the parsed bounce value for debugging
        console.log(
          `Parsed bounce value from column 10: ${row[10]} => ${item.bounced}`
        );

        // Calculate percentage
        if (item.queued > 0) {
          item.percentAnswered = Math.round(
            (item.answered / item.queued) * 100
          );
        }

        items.push(item);
      }

      // Process watermark table to update times
      console.log(`Found ${watermarkTable.length} rows in watermark table`);

      for (const row of watermarkTable) {
        if (row.length < 4) continue;

        const dateTime = row[0];
        const [date, time] = dateTime.split(",").map((s: string) => s.trim());

        // Find corresponding item
        const item = items.find((i) => i.date === date && i.time === time);
        if (item) {
          item.longestWait = row[2] || "00:00:00";
          item.longestAnswer = row[3] || "00:00:00";
          item.longestAbandoned = row[4] || "00:00:00";
        }
      }
    }

    console.log(`Parsed ${items.length} complete data items`);

    // Debug output to check the bounced calls values
    items.forEach((item) => {
      console.log(`${item.date}, ${item.time}: Bounced = ${item.bounced}`);
    });

    return items;
  }
}
