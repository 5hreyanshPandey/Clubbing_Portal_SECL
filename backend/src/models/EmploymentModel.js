
const mongoose = require('mongoose');

const employmentSchema = new mongoose.Schema({
  land_id: { type: mongoose.Schema.Types.ObjectId, ref: 't_lnr_app_acq_award', required: true },
  acq_awd_id: { type: String, required: true },
  provided: { type: String, enum: ['Yes', 'No'], default: 'No' },
  consent: { type: String, enum: ['Given', 'Received', 'No'], default: 'No' },
  statement_1a_no: String,
  landowner_name: String,
  total_area_clubbed: { type: String, validate: { validator: v => !isNaN(parseFloat(v)), message: 'Must be a valid number' } },
  employments_generated: { type: Number, min: 0 },
  employments_provided: { type: Number, min: 0 },
  sanction_order_no: String,
  person_employed: [{ type: String, validate: { validator: v => v.trim() !== '', message: 'Person employed name cannot be empty' } }],
  compensation_in_lieu: String,
  compensation_amount: { type: String, validate: { validator: v => !v || !isNaN(parseFloat(v)), message: 'Must be a valid number or empty' } },
  clubbed_with: [{ type: mongoose.Schema.Types.ObjectId, ref: 't_lnr_app_acq_award' }]
});

module.exports = mongoose.model('Employment', employmentSchema);
