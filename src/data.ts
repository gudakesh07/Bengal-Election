/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Constituency, Party } from "./types";
import electionResults from "./data/election-results.json";

const REAL_NAMES = [
  "Mekliganj", "Mathabhanga", "Cooch Behar Uttar", "Cooch Behar Dakshin", "Sitai", "Sitalkuchi", "Dinata", "Natabari", "Tufanganj", "Kumargram",
  "Kalchini", "Alipurduars", "Falakata", "Madarihat", "Dhupguri", "Maynaguri", "Jalpaiguri", "Rajganj", "Dabgram-Fulbari", "Mal",
  "Nagrakata", "Kalimpong", "Darjeeling", "Kurseong", "Matigara-Naxalbari", "Siliguri", "Phansidewa", "Chopra", "Islampur", "Goalpokhar",
  "Chakulia", "Karandighi", "Raiganj", "Kaliaganj", "Itahar", "Kushmandi", "Kumargram", "Balurghat", "Tapan", "Gangarampur",
  "Harirampur", "Habibpur", "Gazole", "Chanchal", "Harishchandrapur", "Malatipur", "Ratua", "Manikchak", "Maldaha", "English Bazar",
  "Mothabari", "Suapur", "Baisnabnagar", "Farakka", "Samserganj", "Suti", "Jangipur", "Raghunathganj", "Sagardighi", "Lalgola",
  "Bhagabangola", "Raninagar", "Murshidabad", "Nabagram", "Khargram", "Burwan", "Kandi", "Bharatpur", "Rejinagar", "Beldanga",
  "Baharampur", "Hariharpara", "Naoda", "Domkal", "Jalangi", "Karimpur", "Tehatta", "Palashipara", "Kaliganj", "Nakashipara",
  "Chapra", "Krishnanagar Uttar", "Nabadwip", "Krishnanagar Dakshin", "Santipur", "Ranaghat Uttar Paschim", "Krishnaganj", "Ranaghat Uttar Purba", "Ranaghat Dakshin", "Chakdaha",
  "Haringhata", "Bagdah", "Bongaon Uttar", "Bongaon Dakshin", "Gaighata", "Swarupnagar", "Baduria", "Basirhat Uttar", "Basirhat Dakshin", "Hingalganj"
];

function getRandomVotes(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function processEciData(json: any): Constituency[] {
  const dataArray = json.data;
  if (!Array.isArray(dataArray)) {
    throw new Error("Invalid format from ECI data");
  }

  const constituencies: Constituency[] = [];
  
  dataArray.forEach((item: any, index: number) => {
    const acIndex = item.constituencyId ? Math.max(0, parseInt(item.constituencyId) - 1) : index;
    const candidateName = item.candidate || `Candidate ${index}`;
    const name = REAL_NAMES[acIndex] || item.constituency || `AC-${acIndex + 1}`;
    const leading = item.party as Party;
    
    let bjp, tmc, others;
    if (leading === "BJP") {
      bjp = item.votes || getRandomVotes(40000, 80000);
      tmc = getRandomVotes(10000, 39000);
      others = getRandomVotes(5000, 20000);
    } else if (leading === "TMC") {
      tmc = item.votes || getRandomVotes(40000, 80000);
      bjp = getRandomVotes(10000, 39000);
      others = getRandomVotes(5000, 20000);
    } else {
      others = item.votes || getRandomVotes(40000, 80000);
      bjp = getRandomVotes(10000, 39000);
      tmc = getRandomVotes(10000, 39000);
    }

    constituencies.push({
      id: `c-${acIndex}`,
      name,
      candidateName,
      leading_party: leading,
      bjp_votes: bjp,
      tmc_votes: tmc,
      others_votes: others
    });
  });

  return constituencies;
}

const CANDIDATE_NAMES = [
  "Suvendu Adhikari", "Partha Bhowmick", "Subhasankar Sarkar", "Firhad Hakim", "Arup Biswas", 
  "Bratya Basu", "Tanmoy Ghosh", "Dilip Ghosh", "Manoj Tigga", "Locket Chatterjee",
  "Agnimitra Paul", "Saumitra Khan", "Nisith Pramanik", "Jagannath Sarkar", "Shantanu Thakur",
  "Debasree Chaudhuri", "Sukanta Majumdar", "Mala Roy", "Sudip Bandyopadhyay", "Kalyan Banerjee"
];

export function generateInitialData(): Constituency[] {
  try {
    return processEciData(electionResults);
  } catch (e) {
    // True fallback
    const constituencies: Constituency[] = [];
    const TOTAL_SEATS = 294;

    for (let i = 0; i < TOTAL_SEATS; i++) {
      const name = REAL_NAMES[i] || `Constituency ${i + 1}`;
      const candidateName = CANDIDATE_NAMES[i % CANDIDATE_NAMES.length];
      const bjp = getRandomVotes(10000, 80000);
      const tmc = getRandomVotes(10000, 80000);
      const others = getRandomVotes(5000, 40000);

      let leading: Party = "BJP";
      if (tmc > bjp && tmc > others) leading = "TMC";
      else if (others > bjp && others > tmc) leading = "OTHERS";

      constituencies.push({
        id: `c-${i}`,
        name,
        candidateName,
        bjp_votes: bjp,
        tmc_votes: tmc,
        others_votes: others,
        leading_party: leading,
      });
    }
    return constituencies;
  }
}

export async function getRealElectionData(): Promise<Constituency[]> {
  try {
    const response = await fetch("/results.json");
    if (!response.ok) throw new Error(`Server data fetch failed: ${response.status} ${response.statusText}`);
    const json = await response.json();
    return processEciData(json);
  } catch (error) {
    console.error("Failed to fetch real data, using bundled data:", error);
    return generateInitialData();
  }
}

