import tranaporter from "../util/transporter.js";

export async function sendOTP(req,res){
    const {email}=req.body
    const OTP=parseInt( Math.random()*1e6)
    try{
        await tranaporter.sendMail({
            to:email,
            from:process.env.GMAIL_USER,
            subject:'Learn Felx OTP ',
            html:`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password - LearnFlex</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
                
                <!-- Email Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            
                            <!-- Main Content Card -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
                                
                                <!-- Header with Brand -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px 40px; text-align: center;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                            LearnFlex
                                        </h1>
                                        <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                                            Your Learning Platform
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Icon Section -->
                                <tr>
                                    <td align="center" style="padding: 40px 40px 20px 40px;">
                                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 17C11.45 17 11 16.55 11 16V12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12V16C13 16.55 12.55 17 12 17ZM13 9H11V7H13V9Z" fill="white"/>
                                            </svg>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Main Message -->
                                <tr>
                                    <td style="padding: 0 40px 30px 40px; text-align: center;">
                                        <h2 style="margin: 0 0 16px 0; color: #1a202c; font-size: 24px; font-weight: 700; line-height: 1.3;">
                                            Password Reset Request
                                        </h2>
                                        <p style="margin: 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                            We received a request to reset your password. Use the OTP code below to proceed with resetting your password.
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- OTP Code Box -->
                                <tr>
                                    <td align="center" style="padding: 0 40px 30px 40px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="background: linear-gradient(135deg, #f6f8fc 0%, #edf2f7 100%); border: 2px dashed #667eea; border-radius: 12px; padding: 30px 50px;">
                                                    <p style="margin: 0 0 10px 0; color: #718096; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                                        Your OTP Code
                                                    </p>
                                                    <div style="font-size: 42px; font-weight: 800; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                        {{${OTP}}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Validity Warning -->
                                <tr>
                                    <td align="center" style="padding: 0 40px 30px 40px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="background-color: #fff5f5; border-left: 4px solid #f56565; border-radius: 8px; padding: 16px 20px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="30" valign="top">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="#f56565"/>
                                                                </svg>
                                                            </td>
                                                            <td style="color: #742a2a; font-size: 14px; line-height: 1.6;">
                                                                <strong style="font-weight: 700;">Important:</strong> This OTP is valid for <strong>15 minutes only</strong>. Please use it immediately to reset your password.
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Security Notice -->
                                <tr>
                                    <td style="padding: 0 40px 30px 40px;">
                                        <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; text-align: left;">
                                            <p style="margin: 0 0 12px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
                                                🔒 Security Tips:
                                            </p>
                                            <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                                                <li>Never share this OTP with anyone</li>
                                                <li>LearnFlex staff will never ask for your OTP</li>
                                                <li>If you didn't request this, please ignore this email</li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Divider -->
                                <tr>
                                    <td style="padding: 0 40px;">
                                        <div style="height: 1px; background-color: #e2e8f0;"></div>
                                    </td>
                                </tr>
                                
                                <!-- Footer Info -->
                                <tr>
                                    <td style="padding: 30px 40px;">
                                        <p style="margin: 0 0 12px 0; color: #718096; font-size: 14px; line-height: 1.6; text-align: center;">
                                            Didn't request a password reset? You can safely ignore this email.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 13px; text-align: center;">
                                            This is an automated message, please do not reply to this email.
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Footer Branding -->
                                <tr>
                                    <td style="background-color: #f7fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px; font-weight: 600;">
                                            LearnFlex - Empowering Your Learning Journey
                                        </p>
                                        <p style="margin: 0 0 16px 0; color: #a0aec0; font-size: 12px;">
                                            © 2024 LearnFlex. All rights reserved.
                                        </p>
                                        <div style="margin-top: 16px;">
                                            <a href="#" style="display: inline-block; margin: 0 8px; color: #667eea; text-decoration: none; font-size: 12px;">Help Center</a>
                                            <span style="color: #cbd5e0;">•</span>
                                            <a href="#" style="display: inline-block; margin: 0 8px; color: #667eea; text-decoration: none; font-size: 12px;">Privacy Policy</a>
                                            <span style="color: #cbd5e0;">•</span>
                                            <a href="#" style="display: inline-block; margin: 0 8px; color: #667eea; text-decoration: none; font-size: 12px;">Contact Us</a>
                                        </div>
                                    </td>
                                </tr>
                                
                            </table>
                            
                        </td>
                    </tr>
                </table>
                
            </body>
            </html>
            `
        })
        return res.json({OTP:OTP});
    }catch(e){
        console.log("error in sending mail",e)
        return res.status(500)
    }
}