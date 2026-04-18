import React from 'react'

function Form() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Disease Detection Form
        </h1>

        <form className="space-y-4">

          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input 
              type="text" 
              name="name"
              placeholder="Enter Name"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block font-medium mb-1">Age</label>
            <input 
              type="number" 
              name="age" 
              min="0" 
              max="120"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-medium mb-1">Gender</label>
            <div className="flex gap-4">
              <label><input type="radio" name="gender" value="male" /> Male</label>
              <label><input type="radio" name="gender" value="female" /> Female</label>
              <label><input type="radio" name="gender" value="other" /> Other</label>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-medium mb-1">Location</label>
            <input 
              type="text" 
              name="location" 
              placeholder="Enter your city"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Symptoms */}
          <div>
            <p className="font-medium mb-2">Select Symptoms</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Fever","Headache","Vomiting","Diarrhea",
                "Skin rash","Cough","Breathing difficulty",
                "Fatigue","Muscle pain","Eye redness"
              ].map((symptom) => (
                <label key={symptom} className="flex items-center gap-2">
                  <input type="checkbox" />
                  {symptom}
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block font-medium mb-1">Symptom Duration</label>
            <select 
              name="duration"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>1-2 days</option>
              <option>3-5 days</option>
              <option>1 week</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block font-medium mb-1">Upload Image</label>
            <input 
              type="file"
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block font-medium mb-1">Severity</label>
            <select 
              name="severity"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Severity</option>
              <option>Mild</option>
              <option>Moderate</option>
              <option>Severe</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium mb-1">Additional Notes</label>
            <textarea 
              name="notes"
              placeholder="Write here..."
              className="w-full border rounded-lg p-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>

          {/* Consent */}
          <div className="flex items-center gap-2">
            <input type="checkbox" required />
            <label>I agree to data usage</label>
          </div>

          {/* Button */}
          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition duration-200"
          >
            Submit
          </button>

        </form>
      </div>
    </div>
  )
}

export default Form