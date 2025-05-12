import { PDFParserService } from "./services/pdf-parser.service";
import { ZendeskService } from "./services/zendesk.service";
import dotenv from "dotenv";
import path from "path";
import pdfParse from "pdf-parse";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function testPDFContent() {
  const zendeskService = new ZendeskService();
  const pdfParser = new PDFParserService();

  try {
    // Get one PDF to test
    const reports = await zendeskService.getCallCenterReports();

    if (reports.length > 0) {
      const firstReport = reports[0];
      console.log(`Testing PDF: ${firstReport.fileName}`);

      // Get the raw text from the PDF to see its structure
      const data = await pdfParse(firstReport.pdfBuffer);

      console.log("\n=== PDF Text Content (first 1000 chars) ===");
      console.log(data.text.substring(0, 1000));

      console.log("\n=== Looking for specific patterns ===");
      const lines = data.text.split("\n");

      // Look for table headers
      lines.forEach((line: string, index: number) => {
        if (
          line.includes("Date and Time") ||
          line.includes("Calls Queued") ||
          line.includes("Call Center Activity") ||
          line.includes("High Water Marks")
        ) {
          console.log(`Line ${index}: ${line}`);
        }
      });

      // Look for data patterns
      console.log("\n=== Looking for data rows ===");
      lines.forEach((line: string, index: number) => {
        // Look for date patterns like "07-04-2025, 09:00"
        if (line.match(/\d{2}-\d{2}-\d{4},\s+\d{2}:\d{2}/)) {
          console.log(`Line ${index}: ${line}`);
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testPDFContent();
