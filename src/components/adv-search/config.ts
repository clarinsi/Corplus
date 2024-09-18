// Ref: https://nl.ijs.si/ME/V6/msd/html/msd-sl.html
// All values are in slovene
export type AdvFilterKeys = keyof typeof filterDef;
export const filterDef = {
    NounType: ["o", "l"],
    VerbType: ["g", "p"],
    AdjType: ["p", "s", "d"],
    Gender: ["m", "z", "s"],
    Number: ["e", "d", "m"],
    Case: ["i", "r", "d", "t", "m", "o"],
    Animate: ["n", "d"],
    Aspect: ["d", "n", "v"],
    VerbForm: ["n", "m", "d", "s", "p", "g", "v"],
    Person: ["p", "d", "t"],
    Negative: ["n", "d"],
    Degree: ["n", "p", "s"],
    Definiteness: ["n", "d"],
    AdvType: ["s", "d"],
    AdvDegree: ["n", "r", "s"],
    PronType: ["o", "s", "k", "z", "p", "c", "v", "n", "l"],
    OwnerNumber: ["e", "d", "m"],
    OwnerGender: ["m", "z", "s"],
    Clitic: ["k", "z"],
    NumForm: ["a", "r", "b"],
    NumType: ["g", "v", "z", "d"],
    ConjType: ["p", "d"],
};

export type GeneratedAdvFilter = { name: AdvFilterKeys; values: string[] };

function generateFilter(keys: AdvFilterKeys[]): GeneratedAdvFilter[] {
    return keys.map((key) => ({ name: key, values: filterDef[key] }));
}

// Note: indexes are very important here
const nounFilters: AdvFilterKeys[] = ["NounType", "Gender", "Number", "Case", "Animate"];
const verbFilters: AdvFilterKeys[] = ["VerbType", "Aspect", "VerbForm", "Person", "Number", "Gender", "Negative"];
const adjFilters: AdvFilterKeys[] = ["AdjType", "Degree", "Gender", "Number", "Case", "Definiteness"];
const advbFilters: AdvFilterKeys[] = ["AdvType", "AdvDegree"];
const pronFilters: AdvFilterKeys[] = [
    "PronType",
    "Person",
    "Gender",
    "Number",
    "Case",
    "OwnerNumber",
    "OwnerGender",
    "Clitic",
];
const numFilters: AdvFilterKeys[] = ["NumForm", "NumType", "Gender", "Number", "Case", "Definiteness"];
const prepFilters: AdvFilterKeys[] = ["Case"];
const conjFilters: AdvFilterKeys[] = ["ConjType"];
const particleFilters: AdvFilterKeys[] = [];
const interjFilters: AdvFilterKeys[] = [];
const abbrevFilters: AdvFilterKeys[] = [];
const punctFilters: AdvFilterKeys[] = [];

export const advFiltersSchema: Record<string, AdvFilterKeys[]> = {
    S: nounFilters,
    G: verbFilters,
    P: adjFilters,
    R: advbFilters,
    Z: pronFilters,
    K: numFilters,
    D: prepFilters,
    V: conjFilters,
    L: particleFilters,
    M: interjFilters,
    O: abbrevFilters,
    U: punctFilters,
};

export const filters: Record<string, GeneratedAdvFilter[]> = {
    S: generateFilter(advFiltersSchema.S),
    G: generateFilter(advFiltersSchema.G),
    P: generateFilter(advFiltersSchema.P),
    R: generateFilter(advFiltersSchema.R),
    Z: generateFilter(advFiltersSchema.Z),
    K: generateFilter(advFiltersSchema.K),
    D: generateFilter(advFiltersSchema.D),
    V: generateFilter(advFiltersSchema.V),
    L: generateFilter(advFiltersSchema.L),
    M: generateFilter(advFiltersSchema.M),
    O: generateFilter(advFiltersSchema.O),
    U: generateFilter(advFiltersSchema.U),
};
