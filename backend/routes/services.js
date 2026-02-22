const express = require('express');
const router = express.Router();

const services = [
  {
    id: 1, title: 'Emergency Care', icon: 'emergency',
    description: '24/7 emergency medical services with state-of-the-art facilities and expert trauma care.',
    features: ['24/7 availability', 'Trauma center', 'Critical care units']
  },
  {
    id: 2, title: 'Cardiology', icon: 'cardiology',
    description: 'Comprehensive heart care with advanced diagnostics and surgical procedures.',
    features: ['Echocardiography', 'Cardiac surgery', 'Heart failure management']
  },
  {
    id: 3, title: 'Neurology', icon: 'neurology',
    description: 'Expert care for brain and nervous system conditions using the latest technology.',
    features: ['MRI & CT scans', 'Stroke treatment', 'Epilepsy management']
  },
  {
    id: 4, title: 'Orthopedics', icon: 'orthopedics',
    description: 'Complete bone, joint and muscle care with minimally invasive procedures.',
    features: ['Joint replacement', 'Sports medicine', 'Spine surgery']
  },
  {
    id: 5, title: 'Pediatrics', icon: 'pediatrics',
    description: 'Specialized healthcare for infants, children and adolescents.',
    features: ['Well-child visits', 'Vaccinations', 'Developmental screening']
  },
  {
    id: 6, title: 'Oncology', icon: 'oncology',
    description: 'Comprehensive cancer care with multidisciplinary approach and cutting-edge treatment.',
    features: ['Chemotherapy', 'Radiation therapy', 'Surgical oncology']
  },
  {
    id: 7, title: 'Dermatology', icon: 'dermatology',
    description: 'Expert diagnosis and treatment of skin, hair and nail conditions.',
    features: ['Skin cancer screening', 'Laser therapy', 'Cosmetic procedures']
  },
  {
    id: 8, title: 'Ophthalmology', icon: 'ophthalmology',
    description: 'Complete eye care services including surgery, vision correction and treatment.',
    features: ['Cataract surgery', 'LASIK', 'Glaucoma treatment']
  }
];

router.get('/', (req, res) => {
  res.json(services);
});

router.get('/:id', (req, res) => {
  const service = services.find(s => s.id === parseInt(req.params.id));
  if (!service) return res.status(404).json({ message: 'Service not found' });
  res.json(service);
});

module.exports = router;
