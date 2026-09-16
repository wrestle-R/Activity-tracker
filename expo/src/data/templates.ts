export type WorkoutTemplate = { name: string; category: 'push' | 'pull' | 'legs'; detail: string; exercises: { group: string; name: string; targetSets: number; targetReps: string }[] };

export const workoutTemplates: WorkoutTemplate[] = [
  { name: 'Push Day 1', category: 'push', detail: 'Chest · shoulders · triceps', exercises: [
    { group: 'Chest', name: 'Flat bench press', targetSets: 3, targetReps: '2×8, 3rd ×12 low' }, { group: 'Chest', name: 'Incline bench press', targetSets: 3, targetReps: '8' }, { group: 'Chest', name: 'Dumbbell press', targetSets: 3, targetReps: '12' }, { group: 'Shoulders', name: 'Overhead press', targetSets: 3, targetReps: '12 light' }, { group: 'Triceps', name: 'Cable pushdowns (2 variations)', targetSets: 3, targetReps: '12 each' },
  ] },
  { name: 'Push Day 2', category: 'push', detail: 'Shoulders · chest · triceps', exercises: [
    { group: 'Shoulders', name: 'Overhead press', targetSets: 3, targetReps: '2×8, 3rd ×12 less' }, { group: 'Chest', name: 'Flat bench press', targetSets: 3, targetReps: '12' }, { group: 'Chest', name: 'Incline press', targetSets: 3, targetReps: '8' }, { group: 'Chest', name: 'Cable flys', targetSets: 3, targetReps: '15' }, { group: 'Triceps', name: 'Pushdown (2–3 variations)', targetSets: 3, targetReps: '12' },
  ] },
  { name: 'Pull Day 1', category: 'pull', detail: 'Back · biceps · rear delts', exercises: [
    { group: 'Back', name: 'Lat pulldown', targetSets: 3, targetReps: '12–16' }, { group: 'Back', name: 'Seated cable row', targetSets: 3, targetReps: '12–16' }, { group: 'Back', name: 'Dumbbell rows', targetSets: 3, targetReps: '8–12 each' }, { group: 'Back', name: 'Shrugs (finisher)', targetSets: 10, targetReps: 'to failure' }, { group: 'Biceps', name: 'Barbell curl', targetSets: 3, targetReps: '8' }, { group: 'Biceps', name: 'Hammer curl', targetSets: 3, targetReps: '10' }, { group: 'Biceps', name: 'Preacher curl', targetSets: 3, targetReps: '8–16' }, { group: 'Rear Delts', name: 'Bent-over rear delt fly', targetSets: 3, targetReps: '8–12' },
  ] },
  { name: 'Pull Day 2', category: 'pull', detail: 'Back · biceps · rear delts', exercises: [
    { group: 'Back', name: 'Lat pulldown', targetSets: 3, targetReps: '8' }, { group: 'Back', name: 'Seated cable row', targetSets: 3, targetReps: '12' }, { group: 'Back', name: 'Lat pulldown (2nd variation)', targetSets: 3, targetReps: '12–16' }, { group: 'Back', name: 'Shrugs (finisher)', targetSets: 10, targetReps: 'to failure' }, { group: 'Biceps', name: 'Barbell curl', targetSets: 3, targetReps: '12' }, { group: 'Biceps', name: 'Cable hammer curl', targetSets: 3, targetReps: '15' }, { group: 'Biceps', name: 'Preacher curl', targetSets: 3, targetReps: '8–16' }, { group: 'Rear Delts', name: 'Cable face pulls', targetSets: 3, targetReps: '15' },
  ] },
  { name: 'Leg Day 1', category: 'legs', detail: 'Quads · hamstrings · calves', exercises: [
    { group: 'Legs', name: 'Squats', targetSets: 3, targetReps: '2×8, 1×12' }, { group: 'Legs', name: 'Lunges', targetSets: 3, targetReps: '12 each' }, { group: 'Legs', name: 'Machine leg extensions', targetSets: 3, targetReps: '12' }, { group: 'Legs', name: 'Romanian deadlift', targetSets: 3, targetReps: '12' }, { group: 'Calves', name: 'Calves', targetSets: 1, targetReps: 'to failure' },
  ] },
  { name: 'Leg Day 2', category: 'legs', detail: 'Glutes · hamstrings · calves', exercises: [
    { group: 'Glutes', name: 'Hip thrust', targetSets: 3, targetReps: '12' }, { group: 'Glutes', name: 'Cable glute kickbacks', targetSets: 3, targetReps: '12' }, { group: 'Hamstrings', name: 'Machine hamstring curls', targetSets: 3, targetReps: '12' }, { group: 'Legs', name: 'Machine leg press', targetSets: 1, targetReps: 'to failure' }, { group: 'Calves', name: 'Calf raises', targetSets: 1, targetReps: 'to failure' },
  ] },
];

