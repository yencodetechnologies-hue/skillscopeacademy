const sendEmail = require("../config/sendEmail");


exports.sendCustomMail = async (req, res) => {

    try {

        const {
            students,
            subject,
            message
        } = req.body;


        console.log("Students received:", students);
        console.log("File:", req.file);


        if (!students) {

            return res.status(400).json({
                success:false,
                message:"Students required"
            });

        }


        let studentList;


        // Handle both JSON and FormData
        if (typeof students === "string") {

            studentList = JSON.parse(students);

        } else {

            studentList = students;

        }


        console.log(
            "Selected Students:",
            studentList
        );



        if (!subject || !message) {

            return res.status(400).json({

                success:false,
                message:"Subject and message required"

            });

        }



        let attachments = [];


        if(req.file){

            attachments.push({

                filename:req.file.originalname,

                content:req.file.buffer,

                contentType:req.file.mimetype

            });

        }




        for(const student of studentList){


            await sendEmail({

                to: student.email,

                subject: subject,


                html:`

<!DOCTYPE html>
<html>

<body style="
margin:0;
padding:0;
background:#f1f5f9;
font-family:Arial;
">


<div style="
max-width:650px;
margin:30px auto;
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 5px 20px rgba(0,0,0,0.1);
">


<div style="
background:linear-gradient(135deg,#2563eb,#0f766e);
padding:30px;
text-align:center;
color:white;
">


<h1>
SkillScope Academy
</h1>


<p>
Professional Learning Platform
</p>


</div>



<div style="
padding:35px;
color:#334155;
line-height:1.7;
">


<h3>
Dear ${student.name},
</h3>


<div style="
background:#f8fafc;
padding:20px;
border-left:5px solid #2563eb;
border-radius:8px;
">


${message}


</div>




<p>
We are excited to share this update with you.
</p>



<a href="https://skillscopeacademy.com"
style="
display:inline-block;
background:#2563eb;
color:white;
padding:12px 25px;
border-radius:8px;
text-decoration:none;
font-weight:bold;
">

Visit SkillScope Academy

</a>



<br/><br/>


Regards,

<br>

<b>
SkillScope Academy Team
</b>


</div>




<div style="
background:#f1f5f9;
padding:20px;
text-align:center;
font-size:13px;
color:#64748b;
">


© 2026 SkillScope Academy


</div>



</div>


</body>

</html>


`,

                attachments: attachments

            });


            console.log(
                "Mail sent:",
                student.email
            );


        }



        return res.status(200).json({

            success:true,

            message:"Custom mails sent successfully"

        });



    }
    catch(error){


        console.log(
            "Custom Mail Error:",
            error
        );


        return res.status(500).json({

            success:false,

            message:error.message

        });


    }

};