import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PromotionMail.css";

const API_URL = import.meta.env.VITE_API_URL;


const PromotionMail = () => {

  const [companies, setCompanies] = useState([]);

  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const [search, setSearch] = useState("");

  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");



  // Fetch Companies

  useEffect(() => {


   const fetchCompanies = async () => {

  try {

    const token = localStorage.getItem("token");


    const res = await axios.get(
      `${API_URL}/api/companies`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );


    console.log("Companies Response:", res.data);


    setCompanies(
      res.data.data || []
    );


  }
  catch(error){

    console.error(
      "Company Fetch Error:",
      error
    );

    setCompanies([]);

  }

};


    fetchCompanies();


  }, []);





  // Search

  const filteredCompanies = companies.filter(
    (company)=>
      company.companyName
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )
  );





  // Select company

  const handleCheckboxChange = (company)=>{


    const exists =
      selectedCompanies.some(
        item=>item.id === company.id
      );


    if(exists){

      setSelectedCompanies(
        selectedCompanies.filter(
          item=>item.id !== company.id
        )
      );

    }
    else{

      setSelectedCompanies([
        ...selectedCompanies,
        company
      ]);

    }


  };






  // Select all

  const handleSelectAll = ()=>{


    if(
      selectedCompanies.length === 
      filteredCompanies.length
    ){

      setSelectedCompanies([]);

    }
    else{

      setSelectedCompanies(
        filteredCompanies
      );

    }


  };






  // Send Promotion Mail
const handleSendMail = async () => {

    if(selectedCompanies.length === 0){
        alert("Please select at least one company");
        return;
    }


    const formData = new FormData();


    formData.append(
        "companies",
        JSON.stringify(selectedCompanies)
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



    try {

        const token = localStorage.getItem("token");


        const response = await axios.post(

            `${API_URL}/api/send-promotion-mail`,

            formData,

            {
                headers:{
                    Authorization:`Bearer ${token}`,
                    "Content-Type":"multipart/form-data"
                }
            }

        );
     if(response.data.success){

    console.log("SUCCESS BLOCK EXECUTED");


    alert("Promotion mail sent successfully ✅");


    setSelectedCompanies([]);

    setSubject("");

    setMessage("");

    setAttachment(null);

}

        console.log(response.data);


    }
    catch(error){

        console.log(error);

    }

};





  return (

    <div className="promotion-container">
        {
 successMessage && (

    <div className="success-alert">

        {successMessage}

    </div>

 )
}


      <div className="promotion-header">


        <h2>
          Offers Mail
        </h2>


        <span>

          Selected Companies :

          <b>
            {" "}
            {selectedCompanies.length}
          </b>

        </span>


      </div>





      <div className="search-box">


        <input

          type="text"

          placeholder="Search Company..."

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
                    filteredCompanies.length > 0 &&
                    selectedCompanies.length === filteredCompanies.length
                  }

                  onChange={handleSelectAll}

                />


              </th>


              <th>Company Name</th>

              <th>Contact Person</th>

              <th>Email</th>

              <th>Mobile Number</th>

              <th>Status</th>


            </tr>


          </thead>




          <tbody>


          {
            filteredCompanies.map(
              company=>(


              <tr key={company._id || company.id}>


                <td>


                  <input

                    type="checkbox"


                    checked={
                      selectedCompanies.some(
                        item=>
                        (item._id || item.id) === 
                        (company._id || company.id)
                      )
                    }


                    onChange={()=>
                      handleCheckboxChange(company)
                    }


                  />


                </td>



                <td>
                  {company.companyName}
                </td>


                <td>
                  {company.contactPerson}
                </td>


                <td>
                  {company.email}
                </td>


                <td>
                  {company.mobileNumber}
                </td>


                <td>

                  <span
                    className={
                      company.status==="Active"
                      ?
                      "status active"
                      :
                      "status inactive"
                    }
                  >

                    {company.status}

                  </span>


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

          placeholder="Enter promotion message"

        />

       <label>
    Attachment (Optional)
</label>


<input

    type="file"

    onChange={(e)=>
        setAttachment(e.target.files[0])
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
            "Send Promotion Mail"
          }


        </button>



      </div>



    </div>

  );

};


export default PromotionMail;