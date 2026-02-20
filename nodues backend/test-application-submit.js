const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testApplicationSubmission() {
    try {
        console.log('🧪 Testing Application Submission\n');

        // First, login to get token
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'student@mitsgwl.ac.in',
            password: 'password123'
        });

        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login successful\n');

        // Create form data
        console.log('2. Preparing application data...');
        const formData = new FormData();

        // Add boolean fields as strings (like frontend does)
        formData.append('hostelInvolved', 'false');
        formData.append('cautionMoneyRefund', 'false');
        formData.append('exitSurveyCompleted', 'true');
        formData.append('feeDuesCleared', 'true');
        formData.append('projectReportSubmitted', 'true');
        formData.append('declarationAccepted', 'true');

        // Create dummy files
        const dummyPDF = Buffer.from('%PDF-1.4 dummy');
        const dummyImage = Buffer.from('dummy image');

        formData.append('feeReceiptsPDF', dummyPDF, {
            filename: 'fee-receipt.pdf',
            contentType: 'application/pdf'
        });
        formData.append('marksheetsPDF', dummyPDF, {
            filename: 'marksheets.pdf',
            contentType: 'application/pdf'
        });
        formData.append('bankProofImage', dummyImage, {
            filename: 'bank-proof.jpg',
            contentType: 'image/jpeg'
        });
        formData.append('idProofImage', dummyImage, {
            filename: 'id-proof.jpg',
            contentType: 'image/jpeg'
        });

        console.log('✅ Form data prepared\n');

        // Submit application
        console.log('3. Submitting application...');
        const response = await axios.post(
            'http://localhost:5000/api/student/application',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('✅ Application submitted successfully!\n');
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('\nFull error:', error.stack);
    }
}

testApplicationSubmission();
