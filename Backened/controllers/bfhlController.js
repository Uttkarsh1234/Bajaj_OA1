const processHierarchy = require("../utils/processHierarchy");

const processData = (req, res) => {

  try {

    const { data } = req.body;

    if (!Array.isArray(data)) {

      return res.status(400).json({

        error: "data must be an array"

      });

    }

    const result = processHierarchy(data);

    result.user_id = "Uttkarsh_05122005";

    result.email_id = "uttkarsh1233.be23@chitkara.edu.in";

    result.college_roll_number = "2310991233";

    res.status(200).json(result);

  }

  catch (error) {

    res.status(500).json({

      error: error.message

    });

  }

};

module.exports = {

  processData

};