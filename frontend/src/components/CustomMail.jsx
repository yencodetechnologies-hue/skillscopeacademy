import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PromotionMail.css";

const API_URL = import.meta.env.VITE_API_URL;


const CustomMail = () => {


  const [students, setStudents] = useState([]);

  const [selectedStudents, setSelectedStudents] = useState([]);

  const [search, setSearch] = useState("");

  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [attachment, setAttachment] = useState(null);

  const [loading, setLoading] = useState(false);




  // Get ID helper

  const getStudentId = (student) => {

    return student._id || student.id;

  };





  // Fetch Students

  useEffect(() => {


    const fetchStudents = async () => {


      try {


        const token = localStorage.getItem("token");


        const res = await axios.get(

          `${API_URL}/api/students`,

          {
            headers:{
              Authorization:`Bearer ${token}`
            }
          }

        );


        console.log(
          "Student Response:",
          res.data.data
        );


        setStudents(
          res.data.data || []
        );


      }
      catch(error){


        console.log(
          "Student Error:",
          error
        );


      }


    };



    fetchStudents();



  }, []);







  // Search

  const filteredStudents = students.filter((student)=>{


    const name =
    student.name?.toLowerCase() || "";


    const email =
    student.email?.toLowerCase() || "";


    const mobile =
    String(

      student.mobileNumber ||

      student.mobile ||

      student.phoneNumber ||

      student.phone ||

      ""

    );



    return (

      name.includes(search.toLowerCase())

      ||

      email.includes(search.toLowerCase())

      ||

      mobile.includes(search)

    );


  });







  // Checkbox Select

  const handleCheckboxChange = (student)=>{


    const id = getStudentId(student);



    const exists = selectedStudents.some(

      item =>
      getStudentId(item) === id

    );



    if(exists){


      setSelectedStudents(

        selectedStudents.filter(

          item =>
          getStudentId(item) !== id

        )

      );


    }
    else{


      setSelectedStudents([

        ...selectedStudents,

        student

      ]);


    }


  };








  // Select All

  const handleSelectAll = ()=>{


    const allSelected =

    filteredStudents.length > 0 &&

    selectedStudents.length === filteredStudents.length;



    if(allSelected){


      setSelectedStudents([]);


    }
    else{


      setSelectedStudents(

        filteredStudents

      );


    }


  };







  // Send Mail

  const handleSendMail = async()=>{


     if(selectedStudents.length === 0){

      alert("Please select at least one student");

      return;

    }


    if(!subject.trim()){

      alert("Please enter mail subject");

      return;

    }


    if(!message.trim()){

      alert("Please enter mail message");

      return;

    }




    const formData = new FormData();



    formData.append(

      "students",

      JSON.stringify(selectedStudents)

    );



    formData.append(

      "subject",

      subject

    );



    formData.append(

      "message",

      message

    );



    if(attachment){


      formData.append(

        "attachment",

        attachment

      );


    }




    try{


      setLoading(true);



      const token =
      localStorage.getItem("token");



      const res = await axios.post(

        `${API_URL}/api/send-custom-mail`,

        formData,

        {

          headers:{

            Authorization:
            `Bearer ${token}`,

            "Content-Type":
            "multipart/form-data"

          }

        }

      );



      console.log(res.data);



      if(res.data.success){


        alert(
          "Custom mail sent successfully ✅"
        );


        setSelectedStudents([]);

        setSubject("");

        setMessage("");

        setAttachment(null);


      }


    }
    catch(error){


      console.log(error);


    }
    finally{


      setLoading(false);


    }


  };









return (

<div className="promotion-container">



<div className="promotion-header">


<h2>
Custom Mail
</h2>


<span>

Selected Students :

<b>
{" "}
{selectedStudents.length}
</b>

</span>


</div>







<div className="search-box">


<input

type="text"

placeholder="Search Student..."

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>


</div>








<div className="table-wrapper">


<table>


<thead>


<tr>


<th>


<input

type="checkbox"


checked={

filteredStudents.length > 0 &&

selectedStudents.length === filteredStudents.length

}


onChange={handleSelectAll}


/>


</th>


<th>
Student Name
</th>


<th>
Email
</th>


<th>
Mobile Number
</th>


</tr>


</thead>







<tbody>


{

filteredStudents.map(student=>(


<tr key={getStudentId(student)}>



<td>


<input

type="checkbox"


checked={

selectedStudents.some(

item =>

getStudentId(item) ===

getStudentId(student)

)

}


onChange={()=>handleCheckboxChange(student)}


/>


</td>





<td>

{
student.name || "-"
}

</td>





<td>

{
student.email || "-"
}

</td>





<td>

{

student.mobileNumber ||

student.mobile ||

student.phoneNumber ||

student.phone ||

"No Number"

}

</td>





</tr>


))


}



</tbody>


</table>


</div>









<div className="mail-section">



<label>
Subject
</label>


<input

value={subject}

onChange={
e=>setSubject(e.target.value)
}

placeholder="Enter mail subject"

/>





<label>
Message
</label>


<textarea

rows="8"

value={message}

onChange={
e=>setMessage(e.target.value)
}

placeholder="Enter message"

/>





<label>
Attachment (Optional)
</label>


<input

type="file"

onChange={
e=>setAttachment(e.target.files[0])
}

/>





<button

onClick={handleSendMail}

disabled={loading}

>


{

loading

?

"Sending..."

:

"Send Custom Mail"

}


</button>



</div>





</div>

);


};


export default CustomMail;