import { shuffle } from "lodash";
import { CANNOT_MATCH_LISTS } from "./cannotMatch";
import { PARTICIPANTS, FAMILY_NAME, PARTICIPANT_NOTIFICATION_EMAILS } from "./participants";

const IS_DEBUGGING = true;

const print = (str: string) => {
  if (IS_DEBUGGING) console.log(str);
};

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
      print(`***${giver} drew themself, which is not allowed.`);
      rotateToBack(matches);
      unsuccessfulDraws++;
      continue;
    }
    try {
      for (const list of CANNOT_MATCH_LISTS)
        if (list.includes(giver) && list.includes(receiver)) {
          print(`***${giver} drew ${receiver}, which is not allowed.`);
          rotateToBack(matches);
          unsuccessfulDraws++;
          throw new Error();
        }
    } catch (error) {
      continue;
    }
    print(`${giver} drew ${receiver}.`);
    matches++;
    if (matches === numberParticipants) {
      wasDrawingSuccessful = true;
      break;
    }
  }
};

while (!wasDrawingSuccessful) {
  drawingRound++;
  print(`\n\n\n${FAMILY_NAME} Gift Exchange - Christmas ${new Date().getFullYear()}\n\nRound ${drawingRound} - Proceedings:\n`);
  drawNames();
  if (!wasDrawingSuccessful) {
    if (drawingRound === unsuccessfulRoundsLimit) {
      print("\nThe maximum number of invalid drawings and unsuccessful rounds was reached, so proceedings will be terminated. Please use less restrictive filters for matchmaking and try again.");
      break;
    }
    print("\nThe maximum number of invalid drawings was reached, so proceedings will be restarted.");
    ({ givers, receivers } = shuffleParticipants());
    continue;
  }
  print(`\nRound ${drawingRound} - Results:\n`);
  for (let i = 0; i < numberParticipants; i++) print(`${givers[i]} drew ${receivers[i]}.`);
  print("\n\nMerry Christmas! See you next year!\n");
  break;
}

if (wasDrawingSuccessful) {
  // TODO: Send emails to participants with their matches.
  // TODO: Log the results of the drawing to a file instead of the console.
}
