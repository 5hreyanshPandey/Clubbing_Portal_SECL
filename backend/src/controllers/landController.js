
const mongoose = require('mongoose');
const Land = require('../models/LandModel');
const Employment = require('../models/EmploymentModel');

const getLandRecords = async (req, res) => {
  try {
    const landData = await Land.find();
    const landIds = landData.map(land => land._id);
    const employments = await Employment.find({ land_id: { $in: landIds } })
      .populate('clubbed_with', 'landowner_at_acquisition landown_size');
    
    const result = landData.map(land => {
      const employment = employments.find(emp => emp.land_id.toString() === land._id.toString());
      return {
        ...land._doc,
        employment: employment ? {
          ...employment._doc,
          clubbed_with: employment.clubbed_with || [] 
        } : null
      };
    });
    
    console.log('Returning land records:', result);
    res.json(result);
  } catch (err) {
    console.error('Error fetching land records:', err);
    res.status(500).json({ message: 'Failed to fetch records: ' + err.message });
  }
};

const getEmploymentRecords = async (req, res) => {
  try {
    const employments = await Employment.find()
      .populate('land_id', 'acq_awd_id')
      .populate('clubbed_with', 'landowner_at_acquisition landown_size');
    console.log('Returning employment records:', employments);
    res.json(employments);
  } catch (err) {
    console.error('Error fetching employment records:', err);
    res.status(500).json({ message: 'Failed to fetch employment records: ' + err.message });
  }
};

const updateLandEmployment = async (req, res) => {
  try {
    const { id } = req.params;
    const employmentData = req.body;
    console.log('Received employment data:', employmentData);

    // Validate clubbed_with
    if (employmentData.clubbed_with) {
      if (!Array.isArray(employmentData.clubbed_with)) {
        console.log('clubbed_with is not an array:', employmentData.clubbed_with);
        return res.status(400).json({ message: 'clubbed_with must be an array' });
      }
      const invalidIds = employmentData.clubbed_with.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        console.log('Invalid ObjectIds in clubbed_with:', invalidIds);
        return res.status(400).json({ message: 'Invalid land IDs in clubbed_with' });
      }
      const validLands = await Land.find({ _id: { $in: employmentData.clubbed_with } });
      if (validLands.length !== employmentData.clubbed_with.length) {
        console.log('Some clubbed_with IDs do not exist:', employmentData.clubbed_with);
        return res.status(400).json({ message: 'Some clubbed_with IDs do not correspond to existing land records' });
      }
    }

    if (employmentData.consent !== 'No') {
      const requiredFields = [
        'statement_1a_no',
        'landowner_name',
        'total_area_clubbed',
        'employments_generated',
        'employments_provided',
        'sanction_order_no'
      ];
      for (const field of requiredFields) {
        if (!employmentData[field] && employmentData[field] !== 0) {
          console.log(`Missing required field: ${field}`);
          return res.status(400).json({ message: `Missing required field: ${field}` });
        }
      }
      const employmentsProvided = parseInt(employmentData.employments_provided) || 0;
      if (!Array.isArray(employmentData.person_employed)) {
        console.log('person_employed is not an array:', employmentData.person_employed);
        return res.status(400).json({ message: 'person_employed must be an array' });
      }
      if (employmentsProvided > 0 && employmentsProvided !== employmentData.person_employed.length) {
        console.log(`Mismatch: employments_provided (${employmentsProvided}) vs person_employed length (${employmentData.person_employed.length})`);
        return res.status(400).json({ message: `Number of employed persons (${employmentData.person_employed.length}) does not match Employments Provided (${employmentsProvided})` });
      }
      if (employmentData.person_employed.some(name => !name.trim())) {
        console.log('Empty name found in person_employed:', employmentData.person_employed);
        return res.status(400).json({ message: 'All employed person names must be non-empty' });
      }
    }

    const land = await Land.findById(id);
    if (!land) {
      console.log('Land record not found for id:', id);
      return res.status(404).json({ message: 'Land record not found' });
    }

    let employment = await Employment.findOne({ land_id: id });
    console.log('Existing employment record:', employment);

    if (employment) {
      console.log('Updating employment record for land_id:', id);
      employment = await Employment.findOneAndUpdate(
        { land_id: id },
        { 
          $set: { 
            ...employmentData,
            acq_awd_id: land.acq_awd_id,
            employments_provided: parseInt(employmentData.employments_provided) || 0,
            person_employed: employmentData.person_employed || [],
            clubbed_with: employmentData.clubbed_with || []
          }
        },
        { new: true, runValidators: true }
      ).populate('clubbed_with', 'landowner_at_acquisition landown_size');
      console.log('Updated employment record:', employment);
    } else {
      console.log('Creating new employment record for land_id:', id);
      employment = new Employment({
        land_id: id,
        acq_awd_id: land.acq_awd_id,
        ...employmentData,
        employments_provided: parseInt(employmentData.employments_provided) || 0,
        person_employed: employmentData.person_employed || [],
        clubbed_with: employmentData.clubbed_with || []
      });
      await employment.save();
      await employment.populate('clubbed_with', 'landowner_at_acquisition landown_size');
      console.log('Created employment record:', employment);
    }

    res.json({ message: 'Employment details updated successfully', data: employment });
  } catch (err) {
    console.error('Error updating employment:', err);
    res.status(500).json({ message: 'Failed to update employment: ' + err.message });
  }
};

module.exports = { getLandRecords, getEmploymentRecords, updateLandEmployment };