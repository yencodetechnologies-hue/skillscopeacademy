import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/customMail.css";

const API_URL = import.meta.env.VITE_API_URL;


const CustomMail = () => {


  const [students, setStudents] = useState([]);

  const [selectedStudents, setSelectedStudents] = useState([]);

  const [search, setSearch] = useState("");

  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [attachment, setAttachment] = useState(null);

  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
const recordsPerPage = 10;



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

  // Pagination
const totalPages = Math.ceil(
  filteredStudents.length / recordsPerPage
);

const indexOfLastStudent =
  currentPage * recordsPerPage;

const indexOfFirstStudent =
  indexOfLastStudent - recordsPerPage;

const currentStudents =
  filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );


const handleSendWhatsApp = () => {
  if (selectedStudents.length === 0) {
    alert("Please select at least one student");
    return;
  }

  if (!message.trim()) {
    alert("Please enter mail message");
    return;
  }

  // Combine subject + message
  const whatsappMessage =
    `${subject ? subject + "\n\n" : ""}${message}`;

  const encodedMessage =
    encodeURIComponent(whatsappMessage);

  // Open WhatsApp Web
  window.open(
    `https://web.whatsapp.com/send?text=${encodedMessage}`,
    "_blank"
  );
};




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
  onChange={(e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }}
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

  {currentStudents.length > 0 ? (

    currentStudents.map((student) => (

      <tr key={getStudentId(student)}>

        <td>
          <input
            type="checkbox"
            checked={selectedStudents.some(
              item =>
                getStudentId(item) ===
                getStudentId(student)
            )}
            onChange={() =>
              handleCheckboxChange(student)
            }
          />
        </td>

        <td>
          {student.name || "-"}
        </td>

        <td>
          {student.email || "-"}
        </td>

        <td>
          {student.mobileNumber ||
            student.mobile ||
            student.phoneNumber ||
            student.phone ||
            "No Number"}
        </td>

      </tr>

    ))

  ) : (

    <tr>
      <td
        colSpan="4"
        style={{
          textAlign: "center",
          padding: "30px",
          color: "#777"
        }}
      >
        No records found
      </td>
    </tr>

  )}

</tbody>


</table>

{totalPages > 0 && (
  <div className="pagination">

    <button
      onClick={() =>
        setCurrentPage((prev) =>
          Math.max(prev - 1, 1)
        )
      }
      disabled={currentPage === 1}
    >
      Previous
    </button>

    <span>
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() =>
        setCurrentPage((prev) =>
          Math.min(prev + 1, totalPages)
        )
      }
      disabled={currentPage === totalPages}
    >
      Next
    </button>

  </div>
)}


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




<div class="button-container">
<button 

onClick={handleSendMail}

disabled={loading}

>


{

loading

?

"Sending..."

:

"Send Mail"

}


</button>


<button
  type="button"
  onClick={handleSendWhatsApp}
  className="whatsapp-btn"
>
  💬 Send via WhatsApp
</button>
</div>



</div>





</div>

);


};


export default CustomMail;