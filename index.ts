import { shuffle } from "lodash";
import { CANNOT_MATCH_LISTS } from "./cannotMatch";
import { PARTICIPANTS, FAMILY_NAME, PARTICIPANT_NOTIFICATION_EMAILS } from "./participants";

const numberParticipants = PARTICIPANTS.length;
const unsuccessfulDrawsLimit = 5;
const unsuccessfulRoundsLimit = 10;
let drawingRound = 0;
let wasDrawingSuccessful = false;

const shuffleParticipants = () => ({
  givers: shuffle(shuffle(shuffle([...PARTICIPANTS]))),
  receivers: shuffle(shuffle(shuffle([...PARTICIPANTS]))),
});

let { givers, receivers } = shuffleParticipants();

const rotateToBack = (index: number) => {
  receivers.push(receivers.splice(index, 1)[0]);
};

const drawNames = () => {
  let matches = 0;
  let unsuccessfulDraws = 0;
  while (matches < numberParticipants && unsuccessfulDraws < unsuccessfulDrawsLimit) {
    const giver = givers[matches];
    const receiver = receivers[matches];
    if (giver === receiver) {
      console.log(`***${giver} drew themself, which is not allowed.`);
      rotateToBack(matches);
      unsuccessfulDraws++;
      continue;
    }
    try {
      for (const list of CANNOT_MATCH_LISTS)
        if (list.includes(giver) && list.includes(receiver)) {
          console.log(`***${giver} drew ${receiver}, which is not allowed.`);
          rotateToBack(matches);
          unsuccessfulDraws++;
          throw new Error();
        }
    } catch (error) {
      continue;
    }
    console.log(`${giver} drew ${receiver}.`);
    matches++;
    if (matches === numberParticipants) {
      wasDrawingSuccessful = true;
      break;
    }
  }
};

while (!wasDrawingSuccessful) {
  drawingRound++;
  console.log(`\n\n\n${FAMILY_NAME} Gift Exchange - Christmas ${new Date().getFullYear()}\n\nRound ${drawingRound} - Proceedings:\n`);
  drawNames();
  if (!wasDrawingSuccessful) {
    if (drawingRound === unsuccessfulRoundsLimit) {
      console.log("\nThe maximum number of invalid drawings and unsuccessful rounds was reached, so proceedings will be terminated. Please use less restrictive filters for matchmaking and try again.");
      break;
    }
    console.log("\nThe maximum number of invalid drawings was reached, so proceedings will be restarted.");
    ({ givers, receivers } = shuffleParticipants());
    continue;
  }
  console.log(`\nRound ${drawingRound} - Results:\n`);
  for (let i = 0; i < numberParticipants; i++) console.log(`${givers[i]} drew ${receivers[i]}.`);
  console.log("\n\nMerry Christmas! See you next year!\n");
  break;
}
