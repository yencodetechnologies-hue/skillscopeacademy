const parseFormData = (req, res, next) => {

  const fieldsToParse = [
    "description",
    "trainingOverview",
    "vocationalOutcome",
    "feesCharges",
    "optionalCharges",
    "outcomePoints",
    "requirements",
    "pathways"
  ]

  fieldsToParse.forEach(field => {
    if (req.body[field] && typeof req.body[field] === "string") {
      try {
        req.body[field] = JSON.parse(req.body[field])
      } catch (err) {
        console.log(`Error parsing field ${field}`)
      }
    }
  })

  next()
}

module.exports = parseFormData