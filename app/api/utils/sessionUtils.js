///alladis is BROKENNN fuck this fucking stupid ahh shit importing dont make sense no mo



// export function groupSessionsByNoteAndTime(sessions) {
//   const grouped = {};

//   sessions
//     .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
//     .forEach(session => {
//       const noteId = session.note_id;
//       if (!grouped[noteId]) grouped[noteId] = [];

//       grouped[noteId].push(session);
//     });

//   const sessionOnlyGroups = {};

//   Object.entries(grouped).forEach(([noteId, sessionList]) => {
//     sessionOnlyGroups[noteId] = [];
//     let trial = [];

//     for (let i = 0; i < sessionList.length; i++) {
//       const current = sessionList[i];
//       const prev = sessionList[i - 1];

//       if (i === 0 || (new Date(current.created_at) - new Date(prev.created_at)) / 1000 < 300) {
//         trial.push(current);
//       } else {
//         sessionOnlyGroups[noteId].push(trial);
//         trial = [current];
//       }

//       if (i === sessionList.length - 1) {
//         sessionOnlyGroups[noteId].push(trial);
//       }
//     }
//   });

//   return {
//     allSessions: grouped,
//     sessionOnly: sessionOnlyGroups,
//   };
// }