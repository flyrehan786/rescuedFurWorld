import { Cat } from '../models/cat.model';

// Placeholder data — replace with your real cats' stories and photos.
export const CATS: Cat[] = [
  {
    id: 'milo',
    name: 'Milo',
    emoji: '🐱',
    photo: 'assets/vikram-nair-5gG1i5BumGg-unsplash.jpg',
    tagline: 'Found under a car in the rain, now rules the couch.',
    bio: 'Milo was a tiny, soaked kitten when he was found sheltering under a parked car. He was underweight and had an eye infection. Months of care later, he is a confident, cuddly house cat who loves sunny windowsills.',
    rescueDate: '2022-03-14',
    status: 'Thriving',
    healthJourney: [
      { date: '2022-03-14', title: 'Rescued', description: 'Found alone under a car, cold and underweight.', type: 'rescue' },
      { date: '2022-03-16', title: 'First vet visit', description: 'Treated for an eye infection and mild dehydration.', type: 'checkup' },
      { date: '2022-04-02', title: 'Vaccinations started', description: 'First round of core vaccines and deworming.', type: 'treatment' },
      { date: '2022-06-10', title: 'Neutered', description: 'Routine spay/neuter surgery, recovered within a week.', type: 'surgery' },
      { date: '2022-09-01', title: 'Full health clearance', description: 'Vet confirmed healthy weight and no lingering issues.', type: 'milestone' }
    ]
  },
  {
    id: 'luna',
    name: 'Luna',
    emoji: '🐈',
    photo: 'assets/milada-vigerova-BgRs4dzW4Js-unsplash.jpg',
    tagline: 'A shy stray who learned to trust again.',
    bio: 'Luna was rescued from a construction site with a leg injury. She was terrified of people at first. With patience, a safe space, and consistent care, she slowly came out of her shell.',
    rescueDate: '2021-11-02',
    status: 'Thriving',
    healthJourney: [
      { date: '2021-11-02', title: 'Rescued', description: 'Found limping near a construction site.', type: 'rescue' },
      { date: '2021-11-03', title: 'X-ray & splint', description: 'Minor leg fracture diagnosed, splint applied.', type: 'treatment' },
      { date: '2021-12-15', title: 'Splint removed', description: 'Leg healed well, full mobility restored.', type: 'checkup' },
      { date: '2022-02-20', title: 'Spayed', description: 'Routine spay surgery completed successfully.', type: 'surgery' },
      { date: '2022-05-05', title: 'First time being petted', description: 'A huge trust milestone after months of gentle care.', type: 'milestone' }
    ]
  },
  {
    id: 'simba',
    name: 'Simba',
    emoji: '🐈‍⬛',
    photo: 'assets/parastoo-gheisari-shqe2rVyl1Y-unsplash.jpg',
    tagline: 'Senior cat with a heart condition, living his best life.',
    bio: 'Simba came to us as a senior cat with a heart murmur and needed ongoing monitoring. With the right medication and regular checkups, he is stable, affectionate, and loves napping in warm laundry baskets.',
    rescueDate: '2023-01-20',
    status: 'Under care',
    healthJourney: [
      { date: '2023-01-20', title: 'Rescued', description: 'Elderly stray found weak and thin.', type: 'rescue' },
      { date: '2023-01-22', title: 'Diagnosed with heart murmur', description: 'Cardiology checkup revealed a grade II murmur.', type: 'checkup' },
      { date: '2023-02-01', title: 'Medication started', description: 'Began daily heart medication and special diet.', type: 'treatment' },
      { date: '2023-07-15', title: 'Six-month recheck', description: 'Condition stable, no worsening on follow-up echo.', type: 'checkup' },
      { date: '2024-01-15', title: 'One year strong', description: 'Celebrating a full year of stable health.', type: 'milestone' }
    ]
  }
];
