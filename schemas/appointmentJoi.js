// schemas/appointmentJoi.js
const Joi = require('joi');

const appointmentSchema = Joi.object({
  patient_name: Joi.string().allow(null,'').max(200),
  contact: Joi.string().allow(null,'').max(200),
  appointment_date: Joi.string().allow(null,'').regex(/^\d{4}-\d{2}-\d{2}$/).message('Use YYYY-MM-DD or null'),
  appointment_time: Joi.string().allow(null,'').regex(/^\d{2}:\d{2}$/).message('Use HH:MM 24h or null'),
  department: Joi.string().allow(null,'').max(200),
  location: Joi.string().allow(null,'').max(300),
  original_text: Joi.string().required(),
  ambiguity_flags: Joi.array().items(Joi.string()).required(),
  confidence: Joi.number().min(0).max(1).required(),
  requires_human_review: Joi.boolean().required()
});

module.exports = appointmentSchema;
