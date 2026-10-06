/** Jurisdictions and fuel stations used by the IFTA demo seed and the demo receipt parser. */

export const IFTA_JURISDICTION_NAMES: Record<string, string> = {
  AL: 'Alabama',
  FL: 'Florida',
  GA: 'Georgia',
  IL: 'Illinois',
  IN: 'Indiana',
  KY: 'Kentucky',
  MS: 'Mississippi',
  NC: 'North Carolina',
  OH: 'Ohio',
  PA: 'Pennsylvania',
  SC: 'South Carolina',
  TN: 'Tennessee',
  WV: 'West Virginia',
};

const STATIONS: Record<string, [string, string][]> = {
  GA: [['Pilot Flying J', 'Valdosta, GA'], ["Love's Travel Stop", 'Macon, GA'], ['TA Petro', 'Atlanta, GA'], ['QuikTrip', 'Savannah, GA']],
  FL: [['Pilot Flying J', 'Lake City, FL'], ['TA Petro', 'Jacksonville, FL'], ["Love's Travel Stop", 'Ocala, FL']],
  AL: [["Love's Travel Stop", 'Montgomery, AL'], ['Pilot Flying J', 'Birmingham, AL']],
  TN: [['TA Petro', 'Chattanooga, TN'], ['Pilot Flying J', 'Knoxville, TN'], ["Love's Travel Stop", 'Jackson, TN']],
  SC: [['Pilot Flying J', 'Columbia, SC'], ["Love's Travel Stop", 'Florence, SC']],
  NC: [['TA Petro', 'Charlotte, NC'], ['Pilot Flying J', 'Dunn, NC']],
  OH: [['Pilot Flying J', 'Columbus, OH'], ['TA Petro', 'Toledo, OH'], ["Love's Travel Stop", 'Lodi, OH']],
  IN: [['Pilot Flying J', 'Indianapolis, IN']],
  IL: [["Love's Travel Stop", 'Effingham, IL'], ['TA Petro', 'Chicago, IL']],
  PA: [['Sheetz', 'Harrisburg, PA'], ['Pilot Flying J', 'Breezewood, PA']],
  KY: [['Pilot Flying J', 'Louisville, KY']],
  WV: [['TA Petro', 'Charleston, WV']],
  MS: [["Love's Travel Stop", 'Meridian, MS']],
};

export function stationsFor(jurisdiction: string): [string, string][] {
  return STATIONS[jurisdiction] ?? [['Fuel stop', jurisdiction]];
}
