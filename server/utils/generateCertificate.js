const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

exports.generateCertificate = async (certificateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user, course, certificateNumber, issuedAt } = certificateData;
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      const fileName = `certificate-${certificateNumber}.pdf`;
      const filePath = path.join(__dirname, '..', 'temp', fileName);

      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, '..', 'temp'))) {
        fs.mkdirSync(path.join(__dirname, '..', 'temp'));
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

      // Title
      doc.fontSize(40)
         .font('Helvetica-Bold')
         .text('Certificate of Completion', 0, 80, { align: 'center' });

      // Subtitle
      doc.fontSize(16)
         .font('Helvetica')
         .text('This is to certify that', 0, 150, { align: 'center' });

      // Student name
      doc.fontSize(30)
         .font('Helvetica-Bold')
         .text(user.name, 0, 190, { align: 'center' });

      // Course info
      doc.fontSize(16)
         .font('Helvetica')
         .text('has successfully completed the course', 0, 240, { align: 'center' });

      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(course.title, 0, 270, { align: 'center' });

      // Date
      const date = new Date(issuedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      doc.fontSize(14)
         .font('Helvetica')
         .text(`Issued on: ${date}`, 0, 340, { align: 'center' });

      // Certificate number
      doc.fontSize(10)
         .text(`Certificate No: ${certificateNumber}`, 0, 380, { align: 'center' });

      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(
        `${process.env.CLIENT_URL}/verify-certificate/${certificateNumber}`
      );
      
      // Add QR code to PDF (bottom right)
      doc.image(qrCodeDataURL, doc.page.width - 150, doc.page.height - 150, {
        width: 100,
        height: 100
      });

      // Signature line
      doc.moveTo(100, doc.page.height - 100)
         .lineTo(300, doc.page.height - 100)
         .stroke();
      
      doc.fontSize(12)
         .text('Instructor Signature', 100, doc.page.height - 85);

      // Finalize PDF
      doc.end();

      stream.on('finish', async () => {
        try {
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'learnhub/certificates',
            resource_type: 'raw'
          });

          // Delete temp file
          fs.unlinkSync(filePath);

          resolve(result.secure_url);
        } catch (uploadError) {
          reject(uploadError);
        }
      });

    } catch (error) {
      reject(error);
    }
  });
};
