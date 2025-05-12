import { ZendeskService } from "./services/zendesk.service";
import dotenv from "dotenv";
import path from "path";
import pdfParse from "pdf-parse";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function debugPDFFormat() {
  const zendeskService = new ZendeskService();

  try {
    const reports = await zendeskService.getCallCenterReports();

    if (reports.length > 0) {
      const firstReport = reports[0];
      console.log(`Debugging PDF: ${firstReport.fileName}`);

      const data = await pdfParse(firstReport.pdfBuffer);
      const lines = data.text.split("\n");

      console.log("\n=== Lines containing date patterns ===");
      lines.forEach((line, index) => {
        if (line.match(/^\d{2}-\d{2}-\d{4},\s+\d{2}:\d{2}/)) {
          console.log(`Line ${index}: "${line}"`);

          // Show character codes to see invisible characters
          console.log("Character codes:");
          for (let i = 0; i < Math.min(line.length, 50); i++) {
            console.log(`  [${i}]: '${line[i]}' (${line.charCodeAt(i)})`);
          }
          console.log("---");
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

debugPDFFormat();
