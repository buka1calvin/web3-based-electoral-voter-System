import {
  Canister,
  nat64,
  text,
  StableBTreeMap,
  query,
  update,
  Vec,
  Result,
  Opt,
  Ok,
  Err,
  ic,
  Principal,
  Variant,
  Record,
} from "azle";

import { v4 as uuidv4 } from "uuid";

let nationalIds = text;

const Candidate = Record({
  id: text,
  createdAt: nat64,
  name: text,
  nationalId: text,
  countVote: Vec(nationalIds),
});

const Voter = Record({
  id: text,
  name: text,
  createdAt: nat64,
  nationalId: text,
});

const VotedRecord = Record({
  voterId: text,
  candidateId: text,
  createdAt: nat64,
});

const candidateError = Variant({
  CandidateDoesNotExist: text,
  UserAlreadyExist: text,
  UserAlreadyVoted: text,
});

let candidates = StableBTreeMap(text, Candidate, 0);
let voters = StableBTreeMap(text, Voter, 0);
let votedRecords = StableBTreeMap(text, VotedRecord, 0);

export default Canister({
  getCandidate: query([], Vec(Candidate), () => {
    return candidates.values();
  }),

  getCandidateById: query([text], Opt(Candidate), (id) => {
    return candidates.get(id);
  }),

  createCandidate: update(
    [text, text],
    Result(Candidate, candidateError),
    (name, nationalId) => {
      const candidateOpt = candidates.get(nationalId);
      if ("None" in candidateOpt) {
        return Err({
          UserAlreadyExist:
            "Candidate with the given nationalId already exists.",
        });
      }

      const candidate = {
        id: uuidv4(),
        name,
        createdAt: ic.time(),
        nationalId,
        countVote: [],
      };
      candidates.insert(nationalId, candidate);
      return Ok(candidate);
    }
  ),

  createUserToVote: update(
    [text, text],
    Result(Voter, Variant({ UserAlreadyExist: text })),
    (name, nationalId) => {
      const voterOpt = voters.get(nationalId);
      if ("Some" in voterOpt) {
        return Err({
          UserAlreadyExist: "Voter with the given nationalId already exists.",
        });
      }

      const voter = {
        id: uuidv4(),
        name,
        createdAt: ic.time(),
        nationalId,
      };
      voters.insert(nationalId, voter);
      return Ok(voter);
    }
  ),

  getUserToVote: query([], Vec(Voter), () => {
    return voters.values();
  }),



//   voteForCandidate: update([text, text], Result(Voter, Variant({ CandidateDoesNotExist: text, UserAlreadyVoted: text })), (voterNationalId, candidateId) => {
//     const voterOpt = voters.get(voterNationalId);
//     if ("None" in voterOpt) {
//       return Err({
//         UserDoesNotExist: "Voter with the given nationalId does not exist.",
//       });
//     }

//     const candidateOpt = candidates.get(candidateId);
//     if ("None" in candidateOpt) {
//       return Err({
//         CandidateDoesNotExist: "Candidate with the given nationalId does not exist.",
//       });
//     }

//     const voter = voterOpt.unwrap()
//     const candidate = candidateOpt.unwrap();

//     // Check if the voter has already voted`
//     if (voter.nationalId in candidate.countVote) {
//       return Err({
//         UserAlreadyVoted: "Voter with the given nationalId has already voted for this candidate.",
//       });
//     }

//     // Update the countVote for the candidate and mark the voter as voted
//     candidate.countVote.push(voter.nationalId);
//     candidates.insert(candidateId, candidate);
//     voters.insert(voterNationalId, { ...voter, voted: true });

//     // Record the vote
//     const voteRecord = {
//       voterId: voter.nationalId,
//       candidateId: candidate.id,
//       createdAt: ic.time(),
//     };
//     votedRecords.insert(voteRecord.createdAt, voteRecord);

//     return Ok(voter);
//   }),

  // getVotedUsers: query([], Vec(Voter), () => {
  //   // Filter voters who have voted
  //   return voters.values().filter((voter:any) => voter.voted);
  // }),

  // getVoteCountForCandidate: query([text], Opt(nat64), (candidateNationalId) => {
  //   const candidateOpt = candidates.get(candidateNationalId);
  //   if ("None" in candidateOpt) {
  //     const candidate = candidateOpt.unwrap();
  //     return Opt(candidate.countVote.length);
  //   } else {
  //     return Opt(null);
  //   }
  // }),

  getVotedRecords: query([], Vec(VotedRecord), () => {
    return votedRecords.values();
  }),
});
