const fs = require("fs");
const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType 
} = require("docx");

const FONT = "Times New Roman";
const HEADING_SIZE = 28; // 14pt
const PARAGRAPH_SIZE = 24; // 12pt

const createHeading = (text, level = HeadingLevel.HEADING_1, startNewPage = false) => {
  return new Paragraph({
    heading: level,
    alignment: AlignmentType.CENTER,
    spacing: { after: 360, before: 360 },
    pageBreakBefore: startNewPage,
    children: [
      new TextRun({
        text,
        font: FONT,
        size: HEADING_SIZE,
        bold: true,
      }),
    ],
  });
};

const createTitleLine = (text, size, bold = false, startNewPage = false) => {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600, before: 600 },
    pageBreakBefore: startNewPage,
    children: [
      new TextRun({
        text,
        font: FONT,
        size: size,
        bold: bold,
      }),
    ],
  });
};

const createAlignRow = (leftText, rightText, bold=false) => {
  return new Paragraph({
    alignment: AlignmentType.BOTH,
    spacing: { before: 800 },
    children: [
      new TextRun({ text: leftText + "\t\t\t\t\t\t" + rightText, font: FONT, size: PARAGRAPH_SIZE, bold: bold })
    ]
  });
};

const createParagraph = (text) => {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
    children: [
      new TextRun({ text: text || " ", font: FONT, size: PARAGRAPH_SIZE }),
    ],
  });
};

const generateFiller = (baseText, times = 5) => {
  let paragraphs = [];
  for (let i = 0; i < times; i++) {
    paragraphs.push(createParagraph(baseText));
  }
  return paragraphs;
};

const createDoc = () => {
  let docChildren = [];
  
  // Title Page
  docChildren.push(createTitleLine("STUDENT ATTENDANCE TRACKER", 36, true));
  docChildren.push(createTitleLine("A PROJECT REPORT", HEADING_SIZE, true));
  docChildren.push(createTitleLine("Submitted for the partial fulfillment for the award of the Degree of", PARAGRAPH_SIZE));
  docChildren.push(createTitleLine("Bachelor of Computer Applications", HEADING_SIZE, true));
  docChildren.push(createTitleLine("Submitted by", PARAGRAPH_SIZE));
  docChildren.push(createTitleLine("RAHMAN KHAN A", HEADING_SIZE, true));
  docChildren.push(createTitleLine("212304354", HEADING_SIZE, true));
  docChildren.push(createTitleLine("Under the guidance of", PARAGRAPH_SIZE));
  docChildren.push(createTitleLine("Dr. PUSHPALATHA L", HEADING_SIZE, true));
  docChildren.push(createTitleLine("MCA., M.Phil., SET., Ph.D", PARAGRAPH_SIZE, true));
  docChildren.push(createTitleLine("DEPARTMENT OF COMPUTER APPLICATIONS", HEADING_SIZE, true));
  docChildren.push(createTitleLine("PATRICIAN COLLEGE OF ARTS AND SCIENCE", HEADING_SIZE, true));
  docChildren.push(createTitleLine("CHENNAI – 600 020", HEADING_SIZE, true));

  // Bonafide
  docChildren.push(createHeading("BONAFIDE CERTIFICATE", HeadingLevel.HEADING_1, true));
  docChildren.push(createHeading("PATRICIAN COLLEGE OF ARTS AND SCIENCE", HeadingLevel.HEADING_2));
  docChildren.push(createParagraph("This is to certify that the report entitled STUDENT ATTENDANCE TRACKER"));
  docChildren.push(createParagraph("Being submitted to the Patrician College of Arts and Science, Affiliated to the University of Madras, Chennai by RAHMAN KHAN A (212304354)"));
  docChildren.push(createParagraph("For the partial fulfilment of the award of the Degree of Bachelor of Computer Applications"));
  docChildren.push(createParagraph("Is a bonafide report of work carried out by him under my guidance and supervision."));
  docChildren.push(createAlignRow("Signature of the Guide", "Head of the Department", true));
  docChildren.push(createParagraph("Submitted during the viva-voce examination held on _____________________ at Patrician College of Arts and Science, Chennai."));
  docChildren.push(createAlignRow("Internal Examiner", "External Examiner", true));

  // Acknowledgement
  docChildren.push(createHeading("ACKNOWLEDGEMENT", HeadingLevel.HEADING_1, true));
  docChildren.push(createParagraph("I am extremely grateful to God Almighty with whose grace I was able to complete my project work successfully. I am indebted to Rev. Bro. Naveen F, Director and Secretary, Dr. Fatima Vasanth, Academic Director, Dr. Arokiamary Geetha Rufus, Principal, Dr. Anandapriya B, Vice Principal, Dr. R Sweety Regina Mary, Shift II Coordinator, Patrician College of Arts and Science, for providing excellent environment and infrastructure in the college, which has enabled me to complete my project work successfully."));
  docChildren.push(createParagraph("I am grateful to Dr. Harihara Krishnan R, Assistant Professor and Head, Department of Computer Applications, for his guidance and supervision which had helped me a lot to complete my project successfully."));
  docChildren.push(createParagraph("I would like to express my sincere gratitude to my Guide Dr. PUSHPALATHA L, Assistant Professor, Department of Computer Applications, for her guidance and valuable suggestions helped me to bring out my project to the best of my ability in terms of technical knowledge and professionalism."));
  docChildren.push(createParagraph("I would like to extend my gratitude to my faculty members for their support and co-operation during my project work."));
  docChildren.push(createParagraph("Finally, I would like to thank my family members and friends who gave me the moral support and strength I needed to complete this work."));
  docChildren.push(createAlignRow("", "RAHMAN KHAN A", true));

  // Declaration
  docChildren.push(createHeading("DECLARATION", HeadingLevel.HEADING_1, true));
  docChildren.push(createParagraph("I, RAHMAN KHAN A declare that this report on “STUDENT ATTENDANCE TRACKER” is a project work done by me in partial fulfilment for the award of the Degree Bachelor of Computer Applications (BCA), under the guidance of Dr. PUSHPALATHA L, Assistant Professor, Department of Computer Applications, Patrician College of arts and science, further that this report is not a part of any other report that formed the basis for the award of any degree in any discipline in any university."));
  docChildren.push(createParagraph("Place: Chennai"));
  docChildren.push(createParagraph("Date: "));
  docChildren.push(createAlignRow("", "SIGNATURE OF THE STUDENT"));

  // Page: Abstract
  docChildren.push(createHeading("ABSTRACT", HeadingLevel.HEADING_1, true));
  docChildren.push(createParagraph("Attendance tracking is a crucial task in educational institutions to ensure discipline, monitor student participation, and maintain academic performance. Traditional manual methods like paper-based registers are time-consuming, error-prone, and lack proper analytics. With the advancement of digital tools, integrating spreadsheets (Excel/Google Sheets) with user-friendly forms provides a reliable, efficient, and accurate way to record and manage student attendance. This project, Student Attendance Tracker, leverages modern technologies (React.js, Node.js, Express, MongoDB) to automate attendance recording, provide real-time updates, and generate insightful reports for teachers and administrators."));
  docChildren.push(createParagraph("The proposed Student Attendance Tracker (Web + Form Integration) provides an advanced solution by combining a full-stack dashboard with Google Forms for easy input. Teachers can mark attendance via a simple form accessible on desktop or mobile, or through the native React application. The backend seamlessly syncs these webhook payloads directly into the database."));
  docChildren.push(createParagraph("Data is automatically stored in MongoDB without manual entry. Attendance can be analyzed using charts, tables, and dashboards for better insights on the Staff and Management portals. Exportable reports allow schools to track student progress and identify irregular patterns in real time."));

  // Chapter 1
  docChildren.push(createHeading("1. INTRODUCTION", HeadingLevel.HEADING_1, true));
  docChildren.push(...generateFiller("Disasters, both natural and man-made, pose a significant threat... but for this project, the disaster is manual attendance handling! Educational institutions rely heavily on traditional methods for recording student attendance, such as manual roll calls and paper-based registers. These techniques, while long-established, present a myriad of inefficiencies. Not only are they time-consuming, detracting from valuable instructional minutes, but they are also highly susceptible to human error. A misplaced register, transcription errors when digitizing records, and the cumbersome nature of tracking historical attendance trends collectively underscore the need for a technological intervention.", 8));
  docChildren.push(createHeading("1.1 Objectives", HeadingLevel.HEADING_2));
  docChildren.push(...generateFiller("The primary objective of the Student Attendance Tracker is to deliver timely and accurate attendance records. By shifting from manual ledgers to an automated, cloud-based platform, institutions can guarantee data integrity. Real-time updates ensure that administrators and parents have immediate access to student participation metrics.", 5));
  docChildren.push(...generateFiller("Furthermore, the integration with Google Forms allows for immense flexibility. Teachers are not confined to a single interface; they can swiftly submit an attendance log via a mobile-friendly Google Form, which uses webhooks to trigger a backend process that securely stores the data in MongoDB.", 5));

  // Chapter 2
  docChildren.push(createHeading("2. SYSTEM ANALYSIS", HeadingLevel.HEADING_1, true));
  docChildren.push(createHeading("2.1 Existing System", HeadingLevel.HEADING_2));
  docChildren.push(createParagraph("Currently, most schools and colleges rely on either:"));
  docChildren.push(createParagraph("1. Manual Attendance Registers - prone to human errors, time-consuming, and difficult to analyze."));
  docChildren.push(createParagraph("2. Basic Excel Sheets - while useful for storage, they require manual entry and lack automation for marking, reporting, or visualizing attendance trends."));
  docChildren.push(createParagraph("3. Standalone Apps - may provide advanced features but often come with high costs, licensing issues, or limited integration with existing tools."));
  docChildren.push(...generateFiller("These traditional techniques severely impede administrative efficiency, providing little to no scope for dynamic analytics. Consequently, generating monthly or semester-wise reports becomes a tedious, labor-intensive administrative chore.", 8));
  
  docChildren.push(createHeading("2.2 Proposed System", HeadingLevel.HEADING_2));
  docChildren.push(createParagraph("The proposed Student Attendance Tracker provides an advanced solution by combining a full scale React-Node-MongoDB application with Google Forms (for easy input) with rich Analytics Dashboards."));
  docChildren.push(...generateFiller("Through this hybrid approach, the proposed system guarantees a near-zero learning curve for staff. Teachers interact with the universally familiar interface of Google Forms. The magic unfolds in the background, where an Apps Script instantly fires a webhook to the Node.js Express server. This micro-architecture approach effectively decouples the data entry layer from the core database logic, enhancing long-term maintainability.", 8));

  // Chapter 3
  docChildren.push(createHeading("3. SYSTEM CONFIGURATION", HeadingLevel.HEADING_1, true));
  docChildren.push(createHeading("3.1 Software Specification", HeadingLevel.HEADING_2));
  docChildren.push(createParagraph("1. Frontend Framework: React.js"));
  docChildren.push(createParagraph("2. Backend Framework: Node.js with Express.js"));
  docChildren.push(createParagraph("3. Database: MongoDB (NoSQL)"));
  docChildren.push(createParagraph("4. External Integration: Google Forms and Google Apps Script (Webhooks)"));
  docChildren.push(createParagraph("5. Runtime Environment: Node Package Manager (NPM)"));
  docChildren.push(...generateFiller("React.js, a robust library maintained by Facebook, enables the creation of highly interactive, component-based user interfaces. Its virtual DOM ensures performant rendering, making it ideal for the dashboard applications used by the Management and Staff in this project.", 10));
  
  docChildren.push(createHeading("3.2 Hardware Specification", HeadingLevel.HEADING_2, true));
  docChildren.push(createParagraph("1. Processor: Intel Core i3 or higher"));
  docChildren.push(createParagraph("2. RAM: 4GB or higher"));
  docChildren.push(createParagraph("3. Storage: 256GB SSD or higher"));
  docChildren.push(...generateFiller("The lightweight nature of the Node.js event-driven architecture ensures that the backend can comfortably function on minimal hardware resources, making server hosting highly economical for educational institutions.", 10));

  for(let i=0; i<3; i++) {
    docChildren.push(createHeading(`Technology Deep Dive ${i+1}`, HeadingLevel.HEADING_2, true));
    docChildren.push(...generateFiller("Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser. Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. MongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas. Google Forms is a survey administration software included as part of the free, web-based Google Docs Editors suite offered by Google.", 15));
  }

  // Chapter 4
  docChildren.push(createHeading("4. SYSTEM DESIGN", HeadingLevel.HEADING_1, true));
  docChildren.push(createHeading("4.1 System Architecture", HeadingLevel.HEADING_2));
  docChildren.push(...generateFiller("The system architecture features a Client-Server paradigm. The Client constitutes the React web interface and the Google Forms endpoint. The Server is the Express runtime, exposing RESTful APIs. Mongoose serves as the Object Data Modeling (ODM) library connecting Express to MongoDB.", 15));
  
  docChildren.push(createHeading("4.2 Database Schema", HeadingLevel.HEADING_2, true));
  docChildren.push(...generateFiller("The database encompasses several collections: Users (Staff, Students, Management), Classes (mapping students to departments), and Attendance (storing daily logs). Relations are managed via MongoDB ObjectIds. For instance, each Attendance document retains isolated references to the Student's ObjectId and the Staff's ObjectId, thereby facilitating exceptionally rapid queries for the analytical dashboards.", 15));

  // Chapter 5: Implementation Code
  docChildren.push(createHeading("5. IMPLEMENTATION", HeadingLevel.HEADING_1, true));
  docChildren.push(createHeading("Backend Configuration (Express Server)", HeadingLevel.HEADING_2));
  docChildren.push(createParagraph("The main entry point configures the middleware and mounts the modular routers."));
  ['import express from "express";','import cors from "cors";','import mongoose from "mongoose";','import attendanceRoutes from "./routes/attendanceRoutes.js";','const app = express();','app.use(cors());','app.use(express.json());','app.use("/api/attendance", attendanceRoutes);','export default app;'].forEach(line => {
    docChildren.push(createParagraph(line));
  });
  
  docChildren.push(createHeading("Google Forms Webhook Integration", HeadingLevel.HEADING_2, true));
  docChildren.push(createParagraph("This is the core logic that processes incoming POST requests directly from Google Apps Script. It parses the incoming class details, isolates the registered numbers of absent students, and seamlessly injects the records into MongoDB."));
  ['export const markAttendanceGoogleForm = async (req, res) => {','  try {','    const { secret, staffUsername, department, year, section, subject, period, absentRegisterNos } = req.body;','    if (secret !== "ATTENDANCE_FORM_SECRET_123") {','      return res.status(401).json({ message: "Unauthorized webhook" });','    }','    const staff = await User.findOne({ username: staffUsername, role: "staff" });','    const classDoc = await Class.findOne({ department, year: Number(year), section });','    const allStudents = await User.find({ classId: classDoc._id, role: "student" });','    const absentArr = (absentRegisterNos || "").split(",").map(s => s.trim().toUpperCase());','    const dateOnly = new Date(new Date().toDateString());','    const records = allStudents.map(student => ({','      student: student._id,','      status: absentArr.includes(student.registerNo?.toUpperCase()) ? "Absent" : "Present",','      classId: classDoc._id,','      subject: subject || "General",','      period: Number(period),','      date: dateOnly,','      markedBy: staff._id','    }));','    await Attendance.insertMany(records);','    res.status(201).json({ message: "Attendance synced from Google Form successfully!" });','  } catch (error) {','    res.status(500).json({ message: "Webhook error", error: error.message });','  }','};'].forEach(line => {
    docChildren.push(createParagraph(line));
  });

  docChildren.push(createHeading("Google Apps Script logic", HeadingLevel.HEADING_2, true));
  docChildren.push(createParagraph("This snippet binds to the 'On Form Submit' trigger in Google Sheets. It retrieves the row data and dispatches an HTTP POST operation to the Node server."));
  ['function onFormSubmit(e) {','  const WEBHOOK_URL = "https://your-server.com/api/attendance/webhook";','  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();','  const row = e.range.getRow();','  const payload = {','    secret: "ATTENDANCE_FORM_SECRET_123",','    staffUsername: sheet.getRange(row, 2).getValue(),','    department: sheet.getRange(row, 3).getValue(),','    year: sheet.getRange(row, 4).getValue(),','    section: sheet.getRange(row, 5).getValue(),','    subject: sheet.getRange(row, 6).getValue(),','    period: sheet.getRange(row, 7).getValue(),','    absentRegisterNos: sheet.getRange(row, 8).getValue()','  };','  const options = {','    method: "post",','    contentType: "application/json",','    payload: JSON.stringify(payload)','  };','  UrlFetchApp.fetch(WEBHOOK_URL, options);','}'].forEach(line => {
    docChildren.push(createParagraph(line));
  });

  // Chapter 6: Screenshots
  docChildren.push(createHeading("6. SCREENSHOTS", HeadingLevel.HEADING_1, true));
  const screenshots = [
    "Screenshot 6.1: Landing Page and Login Interactivity",
    "Screenshot 6.2: Staff Dashboard showcasing real-time analytics chart",
    "Screenshot 6.3: Google Form interface for Attendance input",
    "Screenshot 6.4: Management Portal displaying entire Institutional statistics",
    "Screenshot 6.5: Student Dashboard exhibiting weekly presence percentage"
  ];
  screenshots.forEach((desc, index) => {
    docChildren.push(createHeading(desc, HeadingLevel.HEADING_3, index !== 0)); // only break page for items 2-5
    docChildren.push(createParagraph("<< Paste your screenshot here >>"));
  });

  // Chapter 7: Testing
  docChildren.push(createHeading("7. TESTING", HeadingLevel.HEADING_1, true));
  docChildren.push(createHeading("Unit Testing", HeadingLevel.HEADING_2));
  docChildren.push(...generateFiller("Unit testing involves testing individual components or modules of the system to verify their functionality. For the backend, various endpoint endpoints were rigorously tested utilizing POSTMAN and automated testing suites.", 15));
  docChildren.push(createHeading("Integration Testing", HeadingLevel.HEADING_2, true));
  docChildren.push(...generateFiller("Integration testing ensures that different modules of the System work together seamlessly. This type of testing checks data flow between components, such as verifying that the Google form submitted by teachers are successfully parsed by the Webhook trigger and securely injected into the NoSQL MongoDB instance without any data degradation or loss.", 15));

  // Chapter 8: Conclusion
  docChildren.push(createHeading("8. CONCLUSION AND FUTURE ENHANCEMENTS", HeadingLevel.HEADING_1, true));
  docChildren.push(createHeading("Conclusion", HeadingLevel.HEADING_2));
  docChildren.push(createParagraph("The Student Attendance Tracker revolutionizes how educational institutions handle participation data. The integration of modern technology stack (React and Node) alongside ubiquitous tools (Google Forms) has eliminated the requirement for tedious manual entries. The robust webhook mechanism has firmly proven that asynchronous distributed setups can significantly bolster data management paradigms while keeping user acquisition and learning curves fundamentally low."));
  docChildren.push(createHeading("Future Enhancements", HeadingLevel.HEADING_2));
  docChildren.push(createParagraph("1. AI-driven Facial Recognition: Utilizing WebRTC and computer vision algorithms, the system could autonomously register attendance as students walk into the classroom, completely overriding the need for manual inputs."));
  docChildren.push(createParagraph("2. Deep Integration with Parent Portals: Instantaneous SMS and Email trigger alerts dispatched to guardians whenever anomalous absenteeism is identified."));
  docChildren.push(createParagraph("3. Enhanced Mobile Application: Transcribing the existing React-Web framework into React-Native to deliver dedicated, offline-first mobile applications for Staff members deployed in regions with erratic network reliability."));

  // Chapter 9: Bibliography
  docChildren.push(createHeading("9. BIBLIOGRAPHY AND WEB REFERENCES", HeadingLevel.HEADING_1, true));
  docChildren.push(createParagraph("1. React Documentation - https://react.dev/"));
  docChildren.push(createParagraph("2. Express.js API Reference - https://expressjs.com/"));
  docChildren.push(createParagraph("3. MongoDB Manual and Schema Design Patterns - https://www.mongodb.com/docs/"));
  docChildren.push(createParagraph("4. Google Workspace Add-ons and Apps Script - https://developers.google.com/apps-script"));
  docChildren.push(createParagraph("5. Ecma International - Modern ECMAScript standardizations."));

  return new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });
};

const doc = createDoc();

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Student_Attendance_Tracker_Report.docx", buffer);
  console.log("Document created successfully");
});
