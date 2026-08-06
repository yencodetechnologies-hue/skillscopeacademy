const sendEmail = require("../config/sendEmail");


exports.sendPromotionMail = async (req, res) => {

    try {

        const attachment = req.file;

        console.log("Attachment:", attachment);


        const {
            companies,
            subject,
            message
        } = req.body;



        // Because FormData sends companies as string
        const companyList = JSON.parse(companies);



        if (!companyList || companyList.length === 0) {

            return res.status(400).json({
                success:false,
                message:"Please select at least one company"
            });

        }



        if (!subject || !message) {

            return res.status(400).json({
                success:false,
                message:"Subject and message are required"
            });

        }




        let attachments = [];


        if(attachment){

            attachments.push({

                filename: attachment.originalname,

                content: attachment.buffer,

                contentType: attachment.mimetype

            });

        }





    for (const company of companyList) {

    await sendEmail({

        to: company.email,

        subject: subject,

        html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial">

        <div style="
            max-width:650px;
            margin:30px auto;
            background:white;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,0.1);
        ">

            <div style="
                background:linear-gradient(135deg,#0f766e,#2563eb);
                padding:30px;
                text-align:center;
                color:white;
            ">

                <h1 style="margin:0">
                    Safety Training Academy
                </h1>

                <p>
                    Professional Safety Training & Certification
                </p>

            </div>


            <div style="
                padding:35px;
                color:#334155;
                line-height:1.7;
            ">

                <h3>
                    Hello ${company.contactPerson},
                </h3>


                <p>
                    We hope you are doing well.
                </p>


                <div style="
                    background:#f8fafc;
                    padding:20px;
                    border-left:5px solid #2563eb;
                    border-radius:8px;
                ">

                    ${message}

                </div>



                <p>
                    We would like to introduce our professional safety training programs for your organization.
                </p>



                <a href="https://safetytrainingacademy.com"
                style="
                display:inline-block;
                background:#2563eb;
                color:white;
                padding:12px 25px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
                ">
                    Visit Our Academy
                </a>



                <p style="margin-top:30px">

                Regards,<br>

                <b>
                Safety Training Academy Team
                </b>

                </p>


            </div>



            <div style="
                background:#f1f5f9;
                padding:20px;
                text-align:center;
                color:#64748b;
                font-size:13px;
            ">

            © 2026 Safety Training Academy<br>
            Workplace Safety | Certification

            </div>



        </div>

        </body>
        </html>
        `,


        // attachments MUST be here
        attachments: attachments

    });


    console.log(
        "Promotion mail sent:",
        company.email
    );

}




        return res.status(200).json({

            success:true,

            message:"Promotion mails sent successfully"

        });



    }
    catch(error){

        console.log(
            "Promotion mail error:",
            error
        );


        return res.status(500).json({

            success:false,

            message:error.message

        });


    }

};