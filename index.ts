import { shuffle } from "lodash";
import { CANNOT_MATCH_LISTS } from "./cannotMatch";
import { PARTICIPANTS, FAMILY_NAME, PARTICIPANT_NOTIFICATION_EMAILS, WISH_LISTS } from "./participants";
import { sendEmail } from "./sendEmail";
import fs from "fs/promises";

const IS_DEBUGGING = false;

let proceedings = "";
const appendToProceedings = (str: string) => {
  if (proceedings) proceedings += "\n";
  proceedings += str;
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
      appendToProceedings(`***${giver} drew themself, which is not allowed.`);
      rotateToBack(matches);
      unsuccessfulDraws++;
      continue;
    }
    try {
      for (const list of CANNOT_MATCH_LISTS)
        if (list.includes(giver) && list.includes(receiver)) {
          appendToProceedings(`***${giver} drew ${receiver}, which is not allowed.`);
          rotateToBack(matches);
          unsuccessfulDraws++;
          throw new Error();
        }
    } catch (error) {
      continue;
    }
    appendToProceedings(`${giver} drew ${receiver}.`);
    matches++;
    if (matches === numberParticipants) {
      wasDrawingSuccessful = true;
      break;
    }
  }
};

while (!wasDrawingSuccessful) {
  drawingRound++;
  appendToProceedings(`\n\n\n${FAMILY_NAME} Gift Exchange - Christmas ${new Date().getFullYear()}\n\nRound ${drawingRound} - Proceedings:\n`);
  drawNames();
  if (!wasDrawingSuccessful) {
    if (drawingRound === unsuccessfulRoundsLimit) {
      appendToProceedings(
        "\nThe maximum number of invalid drawings and unsuccessful rounds was reached, so proceedings will be terminated. Please use less restrictive filters for matchmaking and try again."
      );
      break;
    }
    appendToProceedings("\nThe maximum number of invalid drawings was reached, so proceedings will be restarted.");
    ({ givers, receivers } = shuffleParticipants());
    continue;
  }
  appendToProceedings(`\nRound ${drawingRound} - Results:\n`);
  for (let i = 0; i < numberParticipants; i++) appendToProceedings(`${givers[i]} drew ${receivers[i]}.`);
  appendToProceedings("\n\nMerry Christmas! See you next year!\n");
  break;
}

if (IS_DEBUGGING || !wasDrawingSuccessful) console.log(proceedings);
else {
  console.log("\nDrawing successful!");
  const logFilePath = `./log/${String(new Date().getFullYear())}-${String(Date.now())}.txt`;
  fs.writeFile(logFilePath, proceedings)
    .then(() => {
      console.log(`Results successfully logged to file!\nFile name: ${logFilePath}`);
      for (let i = 0; i < numberParticipants; i++) {
        const to_name = givers[i];
        const gift_recipient = receivers[i];
        const email = PARTICIPANT_NOTIFICATION_EMAILS[to_name];
        const wish_list = WISH_LISTS[gift_recipient];
        const emailParams = {
          email,
          to_name,
          gift_recipient,
          wish_list,
        };
        sendEmail(emailParams);
      }
    })
    .catch((error: unknown) => {
      console.log("Error writing to file: ", error);
      console.log("No emails were sent.");
    });
}
