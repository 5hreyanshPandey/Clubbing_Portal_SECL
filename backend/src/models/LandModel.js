

const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  acq_awd_id: String,
  area: String,
  mine: String,
  vill: String,
  acq_mode: String,
  acq_notif_no: String,
  acq_ltr_no_dt: String,
  stmt1a_sl_no: String,
  plot_no: String,
  landowner_at_acquisition: String,
  landowner_statement_1a: String,
  landown_size: { type: String, validate: { validator: v => !isNaN(parseFloat(v)), message: 'Must be a valid number' } },
  landown_cat: String,
  landown_cast: String,
  acq_remark: String,
  created_by: String,
  created_at: String,
  modified_by: String,
  modified_at: String,
  Stat_flag: String,
  comp_status: String,
  comp_date: String,
  appr_acq_rem: String,
  appr_acq_date: String,
});

module.exports = mongoose.model('t_lnr_app_acq_award', landSchema);