import type { Drill, Player, Session } from "./types";

const links: Record<string, string> = {
  "stationary tap": "https://www.youtube.com/watch?v=x3ufIEsdwYo&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=4",
  "taps up and back": "https://www.youtube.com/watch?v=r5Zi1hxMqO4&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=5",
  "staionary scissor": "https://www.youtube.com/watch?v=n6ZI6DnBQqM&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=7",
  "push & scissor": "https://www.youtube.com/watch?v=yxRlPlwEeuI&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=8",
  "right foot 8": "https://www.youtube.com/watch?v=tkBF1DO63AM&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-",
  "left foot 8": "https://www.youtube.com/watch?v=5H5gluO966g&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=15",
  "messie slide": "https://www.youtube.com/watch?v=Tlz9OJOYkEM&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=2",
  "ronaldo combo": "https://www.youtube.com/watch?v=2phbtCpJmxs&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=4",
  "sole turn combo": "https://www.youtube.com/watch?v=sTFtejPV0G0&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=7",
  "maradona turn": "https://www.youtube.com/watch?v=z8zraSIPI6k&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=3",
  "fake shot pull": "https://www.youtube.com/watch?v=xMmrczo6UzE&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=5",
  "body fake combo": "https://www.youtube.com/watch?v=CRTAEnwmd50&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=6",
  "step over inside": "https://www.youtube.com/watch?v=ndQuF62L2KE&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=14",
  "how to slide & roll": "https://www.youtube.com/watch?v=P4rJS_ZNCJY&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=12",
  "how to do in & out boxes": "https://www.youtube.com/watch?v=zWw_cjwrc-k&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=3",
  "how to do v turn": "https://www.youtube.com/watch?v=-0Qni9p5cvs&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=10",
  "how to box step": "https://www.youtube.com/watch?v=aIegmW6KdPY&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=1",
  "how to do the stop & go": "https://www.youtube.com/watch?v=loXlmv_13vU&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=7",
  "how to do the smiley face": "https://www.youtube.com/watch?v=8Tv7oPpLyO8&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=4",
  "how to do the box step": "https://www.youtube.com/watch?v=xKBl6zBTMtw&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=5",
  "how to do the v step": "https://www.youtube.com/watch?v=tNebcM7qeCs&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=13",
  "how to do the scissor step": "https://www.youtube.com/watch?v=r7rH4uQ2Xl4&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=12",
  "how to do the v combo": "https://www.youtube.com/watch?v=8NMHglstOfE&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=15",
  "how to do the all outside": "https://www.youtube.com/watch?v=3djx12EsnTs&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=10",
  "learning the series": "https://www.youtube.com/watch?v=yT8mKo0lGuk",
};

const planRows = [
  ["Stationary Tap", true, "30 Secs", 61, 131, 93.2, 102.6, 70, 22],
  ["Taps Up and Back", false, "30 Secs", 4, 10, 6.7, 7.4, 7, 13],
  ["Staionary Scissor", true, "30 Secs", 38, 99, 60.6, 66.7, 40, 22],
  ["Push & Scissor", false, "30 Secs", 5, 10, 6.9, 7.6, 7, 13],
  ["Right Foot 8", true, "1", 10, 20, 15.4, 17, 12, 19],
  ["Left Foot 8", true, "1", 12, 20, 15.5, 17.1, 12, 19],
  ["Messie slide", true, "1", 9, 17, 13.6, 15, 11, 23],
  ["Ronaldo Combo", true, "1", 9, 16, 13.1, 14.4, 9, 22],
  ["Sole Turn Combo", true, "1", 12, 19, 15.2, 16.8, 15, 22],
  ["MARADONA TURN", true, "1", 10, 19, 14.6, 16.1, 15, 22],
  ["Fake shot pull", true, "1", 10, 19, 13.8, 15.2, 13, 21],
  ["Body fake combo", true, "1", 11, 19, 14, 15.3, 12, 21],
  ["Step over inside", true, "1", 12, 17, 14.2, 15.7, 14, 21],
  ["HOW TO SLIDE & ROLL (Right)", true, "1", 8, 11, 10, 11, 8, 9],
  ["HOW TO SLIDE & ROLL (Left)", true, "1", 8, 13, 10.9, 12, 11, 9],
  ["HOW TO DO IN & OUT BOXES", true, "1", 13, 25, 20.6, 22.6, 19, 9],
  ["How TO DO V TURN", true, "1", 10, 31, 23.8, 26.2, 23, 9],
  ["HOW TO BOX STEP", true, "1", 10, 23, 18, 19.8, 19, 9],
  ["HOW TO DO THE STOP & GO", true, "1", 3, 3, 3, 3.3, 3, 1],
  ["HOW TO DO THE SMILEY FACE", true, "1", 0, 0, 0, 0, undefined, 0],
  ["HOW TO DO THE BOX STEP (Right)", true, "1", 0, 0, 0, 0, undefined, 0],
  ["HOW TO DO THE BOX STEP (Left)", true, "1", 0, 0, 0, 0, undefined, 0],
  ["HOW TO DO THE V STEP", false, "1", 0, 0, 0, 0, undefined, 0],
  ["HOW TO DO THE SCISSOR STEP (LEFT)", false, "1", 0, 0, 0, 0, undefined, 0],
  ["HOW TO DO THE SCISSOR STEP (RIGHT)", false, "1", 0, 0, 0, 0, undefined, 0],
  ["HOW TO DO THE V COMBO (Right)", false, "1", 0, 0, 0, 0, undefined, 0],
  ["HOW TO DO THE V COMBO (Left)", false, "1", 0, 0, 0, 0, undefined, 0],
  ["HOW TO DO THE ALL OUTSIDE", false, "1", 0, 0, 0, 0, undefined, 0],
  ["Learning the Series: Part 1", true, "3", 5, 19, 8.2, 9, 5, 9],
  ["Learning the Series: Part 2", true, "3", 5, 7, 6.2, 6.8, 5, 5],
  ["Learning the Series: Part 3", true, "", 0, 0, 0, 0, 0, 1],
  ["Learning the Series: Part 4", false, "", 0, 0, 0, 0, 0, 1],
  ["Shooting with right foot", true, "5", 16, 50, 21.7, 23.9, 50, 13],
  ["Shooting with left foot", true, "5", 8, 16, 13.3, 14.6, 8, 13],
] as const;

const allDrillRows = [
  {
    "name": "Stationary Boxes",
    "videoLink": "https://www.youtube.com/watch?v=mJmmuulpArk&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O",
    "category": "Beginner Ball Skills"
  },
  {
    "name": "Boxes Up & Back",
    "videoLink": "https://www.youtube.com/watch?v=_LHlY6V2fqM&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=2",
    "category": "Beginner Ball Skills"
  },
  {
    "name": "Box & Roll",
    "videoLink": "https://www.youtube.com/watch?v=-3YP2_plksE&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=3",
    "category": "Beginner Ball Skills"
  },
  {
    "name": "Stationary Taps",
    "videoLink": "https://www.youtube.com/watch?v=x3ufIEsdwYo&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=4",
    "category": "Beginner Ball Skills"
  },
  {
    "name": "Taps Up & Back",
    "videoLink": "https://www.youtube.com/watch?v=r5Zi1hxMqO4&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=5",
    "category": "Beginner Ball Skills"
  },
  {
    "name": "Stationary Scissors",
    "videoLink": "https://www.youtube.com/watch?v=n6ZI6DnBQqM&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=7",
    "category": "Beginner Ball Skills"
  },
  {
    "name": "Push & Scissor",
    "videoLink": "https://www.youtube.com/watch?v=yxRlPlwEeuI&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=8",
    "category": "Beginner Ball Skills"
  },
  {
    "name": "HOW TO DO THE IN & OUT",
    "videoLink": "https://www.youtube.com/watch?v=OuxxtozHsEk&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=9",
    "category": "Beginner Ball Skills"
  },
  {
    "name": "The Snake (3 variations)",
    "videoLink": "https://www.youtube.com/watch?v=3kHdgYMejIM&list=PLsRSijrCyTQeDbDg3IEF5BS-XnrMQUd7O&index=12",
    "category": "Beginner Ball Skills"
  },
  {
    "name": "HOW TO DO THE TRIANGLE STEP",
    "videoLink": "https://www.youtube.com/watch?v=sXZqAn0kOOY&list=PLsRSijrCyTQfnhkwKFsqn5_X2CfPIKVao",
    "category": "1 Cone Drills"
  },
  {
    "name": "HOW TO DO THE PUSH & PULL",
    "videoLink": "https://www.youtube.com/watch?v=efdjWYTEic0&list=PLsRSijrCyTQfnhkwKFsqn5_X2CfPIKVao&index=2",
    "category": "1 Cone Drills"
  },
  {
    "name": "HOW TO DO THE ONE CONE SALSA",
    "videoLink": "https://www.youtube.com/watch?v=ETmpFhnN6d0&list=PLsRSijrCyTQfnhkwKFsqn5_X2CfPIKVao&index=3",
    "category": "1 Cone Drills"
  },
  {
    "name": "HOW TO DO THE V THEN BOX",
    "videoLink": "https://www.youtube.com/watch?v=Mxq07UuZ2SM&list=PLsRSijrCyTQfnhkwKFsqn5_X2CfPIKVao&index=4",
    "category": "1 Cone Drills"
  },
  {
    "name": "HOW TO DO THE V INSIDE",
    "videoLink": "https://www.youtube.com/watch?v=v_Js4m82StQ&list=PLsRSijrCyTQfnhkwKFsqn5_X2CfPIKVao&index=5",
    "category": "1 Cone Drills"
  },
  {
    "name": "HOW TO DO THE CROSSOVER PUSH",
    "videoLink": "https://www.youtube.com/watch?v=AbB-IB6NFs8&list=PLsRSijrCyTQfnhkwKFsqn5_X2CfPIKVao&index=6",
    "category": "1 Cone Drills"
  },
  {
    "name": "HOW TO DO THE BOX THEN ROLL",
    "videoLink": "https://www.youtube.com/watch?v=gfTojQFNofw&list=PLsRSijrCyTQfnhkwKFsqn5_X2CfPIKVao&index=7",
    "category": "1 Cone Drills"
  },
  {
    "name": "HOW TO DO THE V OUTSIDE",
    "videoLink": "https://www.youtube.com/watch?v=tFYweU9J3AA&list=PLsRSijrCyTQfnhkwKFsqn5_X2CfPIKVao&index=8",
    "category": "1 Cone Drills"
  },
  {
    "name": "HOW TO DO THE SQUARE STEP",
    "videoLink": "https://www.youtube.com/watch?v=IbK_QSRFvcM&list=PLsRSijrCyTQfnhkwKFsqn5_X2CfPIKVao&index=9",
    "category": "1 Cone Drills"
  },
  {
    "name": "HOW TO BOX STEP",
    "videoLink": "https://www.youtube.com/watch?v=aIegmW6KdPY&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=1",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO THE CROSS BACK",
    "videoLink": "https://www.youtube.com/watch?v=s6-dBB0ubgQ&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=2",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO IN & OUT BOXES",
    "videoLink": "https://www.youtube.com/watch?v=zWw_cjwrc-k&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=3",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO THE DRAG",
    "videoLink": "https://www.youtube.com/watch?v=nPspDf_ZZw0&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=4",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO THE OUTSIDE V",
    "videoLink": "https://www.youtube.com/watch?v=9wybqZ3bOU0&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=5",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO THE FAKE SHOT, V",
    "videoLink": "https://www.youtube.com/watch?v=MYMyyBLSzFU&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=6",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO THE IRISH JIG",
    "videoLink": "https://www.youtube.com/watch?v=gLC614AEfuA&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=7",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO THE LACES PULL BACK",
    "videoLink": "https://www.youtube.com/watch?v=S_hEeCkdQ7Q&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=9",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO THE V TURN",
    "videoLink": "https://www.youtube.com/watch?v=-0Qni9p5cvs&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=10",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO THE REPEAT V",
    "videoLink": "https://www.youtube.com/watch?v=7er41JHV5cY&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=11",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO SLIDE & ROLL",
    "videoLink": "https://www.youtube.com/watch?v=P4rJS_ZNCJY&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=12",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO HOT STEPPERS",
    "videoLink": "https://www.youtube.com/watch?v=bkMonixbua4&list=PLsRSijrCyTQfqh2x_4EqC_DPWETiR9PSo&index=13",
    "category": "2 Cone Drills"
  },
  {
    "name": "HOW TO DO THE RIGHT FOOT 8",
    "videoLink": "https://www.youtube.com/watch?v=tkBF1DO63AM&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE LEFT FOOT 8",
    "videoLink": "https://www.youtube.com/watch?v=5H5gluO966g&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=15",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE MESSI SLIDE",
    "videoLink": "https://www.youtube.com/watch?v=Tlz9OJOYkEM&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=2",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE MARADONA TURN",
    "videoLink": "https://www.youtube.com/watch?v=z8zraSIPI6k&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=3",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE RONALDO COMBO",
    "videoLink": "https://www.youtube.com/watch?v=2phbtCpJmxs&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=4",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE FAKE SHOT, PULL",
    "videoLink": "https://www.youtube.com/watch?v=xMmrczo6UzE&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=5",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE BODY FAKE COMBO",
    "videoLink": "https://www.youtube.com/watch?v=CRTAEnwmd50&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=6",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE SOLE TURN COMBO",
    "videoLink": "https://www.youtube.com/watch?v=sTFtejPV0G0&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=7",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE V TURN COMBO",
    "videoLink": "https://www.youtube.com/watch?v=p017HYtZcvo&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=8",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE STEP OVER TURN",
    "videoLink": "https://www.youtube.com/watch?v=yWceDAv5EZY&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=9",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE SOLE TURN (RIGHT)",
    "videoLink": "https://www.youtube.com/watch?v=cZrbj465P8E&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=10",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE SOLE TURN (LEFT)",
    "videoLink": "https://www.youtube.com/watch?v=Glw_ijJydVE&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=11",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO A V TURN (RIGHT)",
    "videoLink": "https://www.youtube.com/watch?v=09p9VeAMw5Y&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=12",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO A V TURN (LEFT)",
    "videoLink": "https://www.youtube.com/watch?v=zh6AvoCBmP8&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=13",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE STEP OVER INSIDE",
    "videoLink": "https://www.youtube.com/watch?v=ndQuF62L2KE&list=PLsRSijrCyTQfdtOl85gJ9u9XBWjyr30W-&index=14",
    "category": "2 Cone Turns"
  },
  {
    "name": "HOW TO DO THE STOP & GO REMIX",
    "videoLink": "https://www.youtube.com/watch?v=-MISTsQW0PI&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE IN & OUT",
    "videoLink": "https://www.youtube.com/watch?v=JZ-9tWKzuEE&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=2",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE BOXERS & PUSH",
    "videoLink": "https://www.youtube.com/watch?v=pM3yDxgi5Rc&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=3",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE SMILEY FACE",
    "videoLink": "https://www.youtube.com/watch?v=8Tv7oPpLyO8&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=4",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE BOX STEP",
    "videoLink": "https://www.youtube.com/watch?v=xKBl6zBTMtw&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=5",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE ROLL & PUSH",
    "videoLink": "https://www.youtube.com/watch?v=wCZmqB6vO84&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=6",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE STOP & GO",
    "videoLink": "https://www.youtube.com/watch?v=loXlmv_13vU&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=7",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE OUTSIDE V STEP",
    "videoLink": "https://www.youtube.com/watch?v=1EYoD__-rjA&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=8",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE RIGHT FOOT ONLY",
    "videoLink": "https://www.youtube.com/watch?v=Tz4lm4eGf_Q&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=9",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE LEFT FOOT ONLY",
    "videoLink": "https://www.youtube.com/watch?v=89DiQePkgn8&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=14",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE ALL OUTSIDE",
    "videoLink": "https://www.youtube.com/watch?v=3djx12EsnTs&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=10",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE BACKWARDS V",
    "videoLink": "https://www.youtube.com/watch?v=pz13_9N5LsQ&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=11",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE SCISSOR STEP (LEFT)",
    "videoLink": "https://www.youtube.com/watch?v=r7rH4uQ2Xl4&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=12",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE SCISSOR STEP (RIGHT)",
    "videoLink": "https://www.youtube.com/watch?v=n--ERtUuI38&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=18",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE V STEP",
    "videoLink": "https://www.youtube.com/watch?v=tNebcM7qeCs&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=13",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE V COMBO",
    "videoLink": "https://www.youtube.com/watch?v=8NMHglstOfE&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=15",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE HOT STEPPERS",
    "videoLink": "https://www.youtube.com/watch?v=ycnKpZVLhD8&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=16",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE SLIDE",
    "videoLink": "https://www.youtube.com/watch?v=nFGizLlTOGU&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=17",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE UP & BACKS",
    "videoLink": "https://www.youtube.com/watch?v=o1_BGHsENDU&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=19",
    "category": "10 Cone Turns"
  },
  {
    "name": "HOW TO DO THE SALSA SLIDE",
    "videoLink": "https://www.youtube.com/watch?v=XsngP6ocjf4&list=PLsRSijrCyTQflXzVV-O5QMnov36FcSF7q&index=20",
    "category": "10 Cone Turns"
  },
  {
    "name": "Learning the Series: Part 1",
    "videoLink": "https://www.youtube.com/watch?v=yT8mKo0lGuk&list=PLsRSijrCyTQd_BRdeJxjxQZPlSWxwZfVn&index=2",
    "category": "The Series"
  },
  {
    "name": "Learning the Series: Part 2",
    "videoLink": "https://www.youtube.com/watch?v=QHTGgc7rcRI&list=PLsRSijrCyTQd_BRdeJxjxQZPlSWxwZfVn&index=3",
    "category": "The Series"
  },
  {
    "name": "Learning the Series: Part 3",
    "videoLink": "https://www.youtube.com/watch?v=8mvi-Ej2kvA&list=PLsRSijrCyTQd_BRdeJxjxQZPlSWxwZfVn&index=4",
    "category": "The Series"
  },
  {
    "name": "Learning the Series: Part 4",
    "videoLink": "https://www.youtube.com/watch?v=CIXB_WD4M3M&list=PLsRSijrCyTQd_BRdeJxjxQZPlSWxwZfVn&index=5",
    "category": "The Series"
  },
  {
    "name": "ELITE TRAINING W/ MLS PRO! (30 MIN)",
    "videoLink": "https://www.youtube.com/watch?v=kQkBmzmC4r8&list=PLsRSijrCyTQer7mcABT3dzzokMoseM-TP&index=4",
    "category": "Full Pro Sessions"
  },
  {
    "name": "1000 TOUCHES W/ MLS PRO (SKILLS SESSION)",
    "videoLink": "https://www.youtube.com/watch?v=guZoJVJEJ3E&list=PLsRSijrCyTQer7mcABT3dzzokMoseM-TP&index=1",
    "category": "Full Pro Sessions"
  },
  {
    "name": "HOW TO PRACTICE LIKE A MLS PRO (FULL SKILLS SESSION)",
    "videoLink": "https://www.youtube.com/watch?v=ZkEf6w1Qde8&list=PLsRSijrCyTQer7mcABT3dzzokMoseM-TP&index=2",
    "category": "Full Pro Sessions"
  },
  {
    "name": "PRO SOCCER SKILLS SESSION (10 MIN)",
    "videoLink": "https://www.youtube.com/watch?v=UnZkB7GmKIE&list=PLsRSijrCyTQer7mcABT3dzzokMoseM-TP&index=3",
    "category": "Full Pro Sessions"
  },
  {
    "name": "HOW TO TRAIN LIKE A PRO SOCCER PLAYER! (30 MIN)",
    "videoLink": "https://www.youtube.com/watch?v=cnueza21x-k&list=PLsRSijrCyTQer7mcABT3dzzokMoseM-TP&index=5",
    "category": "Full Pro Sessions"
  },
  {
    "name": "BEGINNER SKILLS SESSION W/ MLS PRO! (15 MIN)",
    "videoLink": "https://www.youtube.com/watch?v=wbyr6XfYadA&list=PLsRSijrCyTQer7mcABT3dzzokMoseM-TP&index=6",
    "category": "Full Pro Sessions"
  },
  {
    "name": "1 Touch & Catch",
    "videoLink": "https://www.youtube.com/watch?v=HRFJlPYhFV0&list=PLsRSijrCyTQdXgUazBXHhu1mYqZQUe-sb&index=1",
    "category": "Beginner Juggling"
  },
  {
    "name": "1 Touch Bounce Juggling",
    "videoLink": "https://www.youtube.com/watch?v=Vkt6jujaeeE&list=PLsRSijrCyTQdXgUazBXHhu1mYqZQUe-sb&index=2",
    "category": "Beginner Juggling"
  },
  {
    "name": "2 Touches & Catch",
    "videoLink": "https://www.youtube.com/watch?v=svFlNblytKE&list=PLsRSijrCyTQdXgUazBXHhu1mYqZQUe-sb&index=3",
    "category": "Beginner Juggling"
  },
  {
    "name": "2 Touch Bounce Juggling",
    "videoLink": "https://www.youtube.com/watch?v=ZK7LVUkRSxc&list=PLsRSijrCyTQdXgUazBXHhu1mYqZQUe-sb&index=4",
    "category": "Beginner Juggling"
  },
  {
    "name": "1 Touch Alternating",
    "videoLink": "https://www.youtube.com/watch?v=jdWl2AxTkwA&list=PLsRSijrCyTQe0b1_1AwawsgD3dCdfWn9I&index=2",
    "category": "Advance Juggling"
  },
  {
    "name": "2 Touch Alternating",
    "videoLink": "https://www.youtube.com/watch?v=Aj9z4Vw4yBw&list=PLsRSijrCyTQe0b1_1AwawsgD3dCdfWn9I&index=5",
    "category": "Advance Juggling"
  },
  {
    "name": "3 Touch Alternating",
    "videoLink": "https://www.youtube.com/watch?v=K_P6f8LrLTs&list=PLsRSijrCyTQe0b1_1AwawsgD3dCdfWn9I&index=9",
    "category": "Advance Juggling"
  },
  {
    "name": "Above the Head Juggling",
    "videoLink": "https://www.youtube.com/watch?v=Iymbb9lEgZU&list=PLsRSijrCyTQe0b1_1AwawsgD3dCdfWn9I&index=3",
    "category": "Advance Juggling"
  },
  {
    "name": "All Body One Touch",
    "videoLink": "https://www.youtube.com/watch?v=VTcrh1GejYI&list=PLsRSijrCyTQe0b1_1AwawsgD3dCdfWn9I&index=4",
    "category": "Advance Juggling"
  },
  {
    "name": "All Body 2 Touches",
    "videoLink": "https://www.youtube.com/watch?v=HfRnbN9vgzA&list=PLsRSijrCyTQe0b1_1AwawsgD3dCdfWn9I&index=7",
    "category": "Advance Juggling"
  },
  {
    "name": "HOW TO DO LOW THEN HIGH JUGGLES",
    "videoLink": "https://www.youtube.com/watch?v=Ga1rZqDoXEM&list=PLsRSijrCyTQe0b1_1AwawsgD3dCdfWn9I",
    "category": "Advance Juggling"
  },
  {
    "name": "Feet & Thigh Combo",
    "videoLink": "https://www.youtube.com/watch?v=_A8wE3yjOxc&list=PLsRSijrCyTQe0b1_1AwawsgD3dCdfWn9I&index=6",
    "category": "Advance Juggling"
  },
  {
    "name": "Head Only Juggling",
    "videoLink": "https://www.youtube.com/watch?v=INMLOlrJKYE&list=PLsRSijrCyTQe0b1_1AwawsgD3dCdfWn9I&index=8",
    "category": "Advance Juggling"
  },
  {
    "name": "The Rainbow",
    "videoLink": "https://www.youtube.com/watch?v=Pd8rjvqI1uc&list=PLsRSijrCyTQfVrtCpgsN3JvqazZm5zbH8&index=1",
    "category": "Beginner Juggling Tricks"
  },
  {
    "name": "One Foot Flick",
    "videoLink": "https://www.youtube.com/watch?v=RO-dWRblWVM&list=PLsRSijrCyTQfVrtCpgsN3JvqazZm5zbH8&index=2",
    "category": "Beginner Juggling Tricks"
  },
  {
    "name": "The Scoop",
    "videoLink": "https://www.youtube.com/watch?v=_A-mqI_r9_o&list=PLsRSijrCyTQfVrtCpgsN3JvqazZm5zbH8&index=3",
    "category": "Beginner Juggling Tricks"
  },
  {
    "name": "The Stomp",
    "videoLink": "https://www.youtube.com/watch?v=r_39aeZdQM8&list=PLsRSijrCyTQfVrtCpgsN3JvqazZm5zbH8&index=4",
    "category": "Beginner Juggling Tricks"
  },
  {
    "name": "Spin Lift",
    "videoLink": "https://www.youtube.com/watch?v=y9A-BaDWh5U&list=PLsRSijrCyTQfVrtCpgsN3JvqazZm5zbH8&index=5",
    "category": "Beginner Juggling Tricks"
  },
  {
    "name": "Toe Pinch",
    "videoLink": "https://www.youtube.com/watch?v=qezJwV_MOeE&list=PLsRSijrCyTQfVrtCpgsN3JvqazZm5zbH8&index=6",
    "category": "Beginner Juggling Tricks"
  },
  {
    "name": "Toe Lift",
    "videoLink": "https://www.youtube.com/watch?v=NxJPdZi4lkk&list=PLsRSijrCyTQfVrtCpgsN3JvqazZm5zbH8&index=7",
    "category": "Beginner Juggling Tricks"
  },
  {
    "name": "Two Foot Flick",
    "videoLink": "https://www.youtube.com/watch?v=LlZ89xz6fFE&list=PLsRSijrCyTQfVrtCpgsN3JvqazZm5zbH8&index=8",
    "category": "Beginner Juggling Tricks"
  },
  {
    "name": "The Touzani",
    "videoLink": "https://www.youtube.com/watch?v=jy6QcTrEwqg&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "Spin Backheel",
    "videoLink": "https://www.youtube.com/watch?v=plcMMxvadyw&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=2",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "The Wingrove",
    "videoLink": "https://www.youtube.com/watch?v=ak8bwXfhRUU&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=3",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "Around the World",
    "videoLink": "https://www.youtube.com/watch?v=-0Gj4kWSKmA&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=4",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "The Crossover",
    "videoLink": "https://www.youtube.com/watch?v=bZekGHNjEyk&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=5",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "Slam Down Lift",
    "videoLink": "https://www.youtube.com/watch?v=JlmUxMHgg0Q&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=6",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "Hop The World",
    "videoLink": "https://www.youtube.com/watch?v=6aZNl5axNgQ&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=7",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "All Body Stalls",
    "videoLink": "https://www.youtube.com/watch?v=8X_Kw_kdYH0&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=8",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "Heel Touch",
    "videoLink": "https://www.youtube.com/watch?v=jqzftLvrhjg&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=9",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "Toe to Toe Lift",
    "videoLink": "https://www.youtube.com/watch?v=mKCtmEqW1_Y&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=10",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "Around the Leg Lift",
    "videoLink": "https://www.youtube.com/watch?v=lgvZws8f37w&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=12",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "Heel to Toe Lift",
    "videoLink": "https://www.youtube.com/watch?v=kFo9mK9B4sQ&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=13",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "HOW TO DO THE WALTZ",
    "videoLink": "https://www.youtube.com/watch?v=kN10A2dp364&list=PLsRSijrCyTQendrnHIO7JDOvh5rDaqU7a&index=14",
    "category": "Advance Juggling Tricks"
  },
  {
    "name": "One In Each",
    "videoLink": "https://www.youtube.com/watch?v=BXkwvaJftPU&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=1",
    "category": "Ladder Drills"
  },
  {
    "name": "Two In Each",
    "videoLink": "https://www.youtube.com/watch?v=_IS4BfFDQbY&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=2",
    "category": "Ladder Drills"
  },
  {
    "name": "Lateral Step",
    "videoLink": "https://www.youtube.com/watch?v=1hGv2LAypeE&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=3",
    "category": "Ladder Drills"
  },
  {
    "name": "Skier",
    "videoLink": "https://www.youtube.com/watch?v=kPBQ70zzFtI&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=4",
    "category": "Ladder Drills"
  },
  {
    "name": "Lateral Hops",
    "videoLink": "https://www.youtube.com/watch?v=RuYLjQHQCkM&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=5",
    "category": "Ladder Drills"
  },
  {
    "name": "Jab Step",
    "videoLink": "https://www.youtube.com/watch?v=aNCZv1FqO1Q&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=6",
    "category": "Ladder Drills"
  },
  {
    "name": "Typewriter",
    "videoLink": "https://www.youtube.com/watch?v=mYAGtjkRZZs&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=7",
    "category": "Ladder Drills"
  },
  {
    "name": "Backwards Typewriter",
    "videoLink": "https://www.youtube.com/watch?v=dg6r4gA9x6M&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=8",
    "category": "Ladder Drills"
  },
  {
    "name": "Karaoke",
    "videoLink": "https://www.youtube.com/watch?v=vc2C3PY4Re8&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=9",
    "category": "Ladder Drills"
  },
  {
    "name": "Karaoke Combo",
    "videoLink": "https://www.youtube.com/watch?v=u657xTuTnkY&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=10",
    "category": "Ladder Drills"
  },
  {
    "name": "2 Forward & 1 Back",
    "videoLink": "https://www.youtube.com/watch?v=whSBbHlMRjw&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=11",
    "category": "Ladder Drills"
  },
  {
    "name": "Lateral Double Step",
    "videoLink": "https://www.youtube.com/watch?v=1nbMBoYr604&list=PLsRSijrCyTQel_Ekr0BVCuGhjGUaMDX84&index=12",
    "category": "Ladder Drills"
  }
];

const findLink = (name: string) => {
  const normalized = name.toLowerCase().replace(/\s*\((right|left)\)/g, "").trim();
  return links[normalized] ?? links[normalized.replace(/^how to /, "how to do ")] ?? "";
};

const jordanSampleDrills: Drill[] = planRows.map((row, index) => ({
  id: `drill-${index + 1}`,
  name: row[0],
  assigned: row[1],
  timer: row[2],
  durationSeconds: parseDuration(row[2]),
  low: row[3],
  high: row[4],
  average: row[5],
  goal: row[6],
  latest: row[7],
  entries: row[8],
  videoLink: findLink(row[0]),
  completed: index < 10,
  rating: Math.min(5, Math.max(1, Math.round(Number(row[5] || 5) / 5))),
  count: "",
  countHistory: [],
  notes: row[1] ? "Assigned from Jordan 2.0 training plan." : "Available drill from Jordan 2.0.",
}));

const existingSeedKeys = new Set(jordanSampleDrills.map(drillSeedKey));

export const sampleDrills: Drill[] = [
  ...jordanSampleDrills,
  ...allDrillRows
    .filter((row) => {
      const key = drillSeedKey(row);
      if (existingSeedKeys.has(key)) return false;
      existingSeedKeys.add(key);
      return true;
    })
    .map((row, index) => ({
      id: `all-drill-${index + 1}`,
      name: row.name,
      assigned: false,
      timer: "1",
      durationSeconds: 60,
      low: 0,
      high: 0,
      average: 0,
      goal: 0,
      latest: undefined,
      entries: 0,
      category: row.category,
      videoLink: row.videoLink,
      completed: false,
      rating: 1,
      count: "",
      countHistory: [],
      notes: "Available drill from All Drills sheet.",
    })),
];

function drillSeedKey(drill: { name: string; videoLink?: string }) {
  return `name:${drill.name.toLowerCase().replace(/\s+/g, " ").trim()}`;
}

function youtubeIdFromLink(url: string) {
  return url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/)?.[1] ?? "";
}

function parseDuration(value: string) {
  const text = String(value || "").toLowerCase();
  if (text.includes("30")) return 30;
  const numeric = Number(text.match(/\d+/)?.[0] || 1);
  return Math.max(1, numeric) * (text.includes("sec") ? 1 : 60);
}

export const defaultPlayerAvatar = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" rx="42" fill="#e7f6ec"/><circle cx="120" cy="116" r="72" fill="#2fb25d"/><path d="M58 116c12-42 36-62 62-62s50 20 62 62c-12 38-36 56-62 56s-50-18-62-56Z" fill="#39c96b"/><circle cx="92" cy="108" r="16" fill="#fff"/><circle cx="148" cy="108" r="16" fill="#fff"/><circle cx="96" cy="112" r="8" fill="#17211b"/><circle cx="144" cy="112" r="8" fill="#17211b"/><path d="M96 145c16 13 32 13 48 0" fill="none" stroke="#17211b" stroke-width="8" stroke-linecap="round"/><path d="M70 62 49 35l39 8M170 62l21-27-39 8" fill="#238447"/><path d="M79 178h82l15 45H64l15-45Z" fill="#fff"/><path d="M89 178h62v45H89z" fill="#237a24"/><text x="120" y="212" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#fff">10</text><circle cx="190" cy="190" r="22" fill="#fff" stroke="#17211b" stroke-width="5"/><path d="M169 190h42M190 169v42" stroke="#17211b" stroke-width="5"/><circle cx="190" cy="190" r="6" fill="#17211b"/></svg>`)}`;

export const samplePlayers: Player[] = [
  {
    id: "player-jordan",
    name: "Jordan",
    notes: "Sample player created from the Jordan 2.0 sheet.",
    drillIds: sampleDrills.map((drill) => drill.id),
    photoDataUrl: defaultPlayerAvatar,
  },
];

export const sampleSessions: Session[] = [
  {
    id: "session-1",
    playerId: "player-jordan",
    date: "2026-05-09",
    minutes: 35,
    completedDrills: 10,
    notes: "Started with ball mastery and finishing work.",
  },
];
