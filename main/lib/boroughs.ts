// lib/boroughs.ts

export interface Borough {
  slug: string;
  name: string;
  areas?: string[];
  blurb?: string;
  /** Postal districts covering the borough — factual, unique per borough. */
  postcodes: string[];
  /** 2-3 well-known local landmarks/centres, used to ground copy in reality. */
  landmarks: string[];
  /** Dominant housing stock — drives which service angle we lead with. */
  propertyProfile: string;
  /** Slugs of 2 neighbouring boroughs, for contextual internal linking. */
  nearbyBoroughs: string[];
}

export const BOROUGHS: Borough[] = [
  {
    slug: "barking-and-dagenham",
    name: "Barking and Dagenham",
    blurb:
      "Covering Barking town centre, Dagenham Heathway and the surrounding residential streets, with regular jobs for both homeowners and local landlords.",
    postcodes: ["IG11", "RM8", "RM9", "RM10"],
    landmarks: ["Barking Town Centre", "Eastbrookend Country Park", "Barking Abbey"],
    propertyProfile: "1930s semis and inter-war terraces",
    nearbyBoroughs: ["havering", "newham"],
  },
  {
    slug: "barnet",
    name: "Barnet",
    blurb:
      "From Finchley and Whetstone to High Barnet, we're a familiar face on the borough's mix of period conversions and post-war family homes.",
    postcodes: ["N3", "N12", "N20", "EN5"],
    landmarks: ["Whetstone", "Finchley Central", "High Barnet"],
    propertyProfile: "1930s suburban semis and Edwardian villas",
    nearbyBoroughs: ["harrow", "enfield"],
  },
  {
    slug: "bexley",
    name: "Bexley",
    blurb:
      "Serving Bexleyheath, Sidcup and Erith, with a strong track record on the borough's traditional terraces and larger detached properties.",
    postcodes: ["DA6", "DA7", "DA14", "DA15"],
    landmarks: ["Bexleyheath Clock Tower", "Danson Park", "Hall Place"],
    propertyProfile: "inter-war terraces and larger 1930s detached houses",
    nearbyBoroughs: ["bromley", "greenwich"],
  },
  {
    slug: "brent",
    name: "Brent",
    blurb:
      "Active across Wembley, Willesden and Kilburn, working on everything from flat refurbishments to full house renovations.",
    postcodes: ["NW10", "HA9", "NW2", "NW6"],
    landmarks: ["Wembley Stadium", "Kilburn High Road", "Willesden Green"],
    propertyProfile: "Edwardian terraces and post-war flat conversions",
    nearbyBoroughs: ["harrow", "ealing"],
  },
  {
    slug: "bromley",
    name: "Bromley",
    blurb:
      "Covering Bromley town centre, Beckenham and Orpington, with plenty of experience on the borough's Victorian and Edwardian stock.",
    postcodes: ["BR1", "BR2", "BR3", "BR6"],
    landmarks: ["Bromley High Street", "The Glades", "Crystal Palace Park"],
    propertyProfile: "Victorian and Edwardian villas with larger gardens",
    nearbyBoroughs: ["croydon", "bexley"],
  },
  {
    slug: "camden",
    name: "Camden",
    blurb:
      "Regular work in Camden Town, Kentish Town and Bloomsbury, including period properties that need careful, considerate site management.",
    postcodes: ["NW1", "NW3", "NW5", "WC1"],
    landmarks: ["Camden Market", "Primrose Hill", "King's Cross"],
    propertyProfile: "Victorian terraces and mansion block conversions",
    nearbyBoroughs: ["islington", "westminster"],
  },
  {
    slug: "croydon",
    name: "Croydon",
    blurb:
      "Serving Croydon town centre, Purley and South Norwood, from single-room upgrades to larger commercial fit-outs.",
    postcodes: ["CR0", "CR2", "CR7", "SE25"],
    landmarks: ["Croydon town centre", "Fairfield Halls", "South Norwood Lake"],
    propertyProfile: "Victorian terraces alongside high-rise town centre developments",
    nearbyBoroughs: ["bromley", "sutton"],
  },
  {
    slug: "ealing",
    name: "Ealing",
    blurb:
      "Covering Ealing Broadway, Acton and Southall, with a good mix of residential extensions and landlord maintenance work.",
    postcodes: ["W5", "W13", "UB1", "UB2"],
    landmarks: ["Ealing Broadway", "Southall Market", "Walpole Park"],
    propertyProfile: "Edwardian semis and converted flats",
    nearbyBoroughs: ["hounslow", "brent"],
  },
  {
    slug: "enfield",
    name: "Enfield",
    blurb:
      "Active in Enfield Town, Southgate and Edmonton, working with homeowners and property managers across the borough.",
    postcodes: ["EN1", "EN2", "EN3", "N21"],
    landmarks: ["Enfield Town", "Southgate", "Forty Hall"],
    propertyProfile: "1930s semis and Victorian terraces",
    nearbyBoroughs: ["barnet", "haringey"],
  },
  {
    slug: "greenwich",
    name: "Greenwich",
    blurb:
      "From Greenwich town centre to Eltham and Woolwich, we're used to working around the borough's mix of historic and new-build housing.",
    postcodes: ["SE10", "SE18", "SE7", "SE3"],
    landmarks: ["Greenwich Park", "Woolwich Arsenal", "the Cutty Sark"],
    propertyProfile: "Georgian townhouses and new-build riverside developments",
    nearbyBoroughs: ["bexley", "lewisham"],
  },
  {
    slug: "hackney",
    name: "Hackney",
    blurb:
      "Covering Hackney Central, Dalston and Stoke Newington, including conversions and terraces that need sympathetic, tidy work.",
    postcodes: ["E8", "E5", "N16", "N1"],
    landmarks: ["Broadway Market", "Victoria Park", "Hackney Central"],
    propertyProfile: "Victorian terraces and warehouse conversions",
    nearbyBoroughs: ["islington", "tower-hamlets"],
  },
  {
    slug: "hammersmith-and-fulham",
    name: "Hammersmith and Fulham",
    blurb:
      "Serving Hammersmith, Fulham and Shepherd's Bush, with experience on both period conversions and modern apartment blocks.",
    postcodes: ["W6", "W12", "SW6", "W14"],
    landmarks: ["Hammersmith Bridge", "Fulham Broadway", "Shepherd's Bush Green"],
    propertyProfile: "period conversions and mansion blocks",
    nearbyBoroughs: ["kensington-and-chelsea", "wandsworth"],
  },
  {
    slug: "haringey",
    name: "Haringey",
    blurb:
      "Covering Wood Green, Muswell Hill and Tottenham, working with homeowners, landlords and local businesses alike.",
    postcodes: ["N8", "N10", "N15", "N17"],
    landmarks: ["Alexandra Palace", "Wood Green shopping city", "Tottenham High Road"],
    propertyProfile: "Victorian terraces and 1930s conversions",
    nearbyBoroughs: ["enfield", "islington"],
  },
  {
    slug: "harrow",
    name: "Harrow",
    blurb:
      "Active across Harrow town centre, Pinner and Wealdstone, with plenty of experience on family homes and rental properties.",
    postcodes: ["HA1", "HA2", "HA3", "HA5"],
    landmarks: ["Harrow-on-the-Hill", "Harrow town centre", "Pinner High Street"],
    propertyProfile: "1930s semis and detached family homes",
    nearbyBoroughs: ["barnet", "brent"],
  },
  {
    slug: "havering",
    name: "Havering",
    blurb:
      "Serving Romford, Hornchurch and Upminster, from routine maintenance through to larger renovation projects.",
    postcodes: ["RM1", "RM2", "RM3", "RM11"],
    landmarks: ["Romford town centre", "Upminster windmill", "Hornchurch Country Park"],
    propertyProfile: "inter-war semis and larger detached houses",
    nearbyBoroughs: ["barking-and-dagenham", "redbridge"],
  },
  {
    slug: "hillingdon",
    name: "Hillingdon",
    blurb:
      "Covering Uxbridge, Hayes and Ruislip, including work near Heathrow for commercial and residential clients.",
    postcodes: ["UB8", "UB10", "UB3", "HA4"],
    landmarks: ["Uxbridge town centre", "Heathrow Airport", "Ruislip Lido"],
    propertyProfile: "1930s semis and post-war estates",
    nearbyBoroughs: ["ealing", "harrow"],
  },
  {
    slug: "hounslow",
    name: "Hounslow",
    blurb:
      "Serving Hounslow town centre, Chiswick and Brentford, on both traditional houses and newer developments.",
    postcodes: ["TW3", "TW4", "TW7", "W4"],
    landmarks: ["Chiswick House", "Hounslow Heath", "Brentford High Street"],
    propertyProfile: "Victorian terraces and riverside new-builds",
    nearbyBoroughs: ["ealing", "richmond-upon-thames"],
  },
  {
    slug: "islington",
    name: "Islington",
    blurb:
      "Regular work in Islington, Highbury and Angel, with a good understanding of the borough's period terraces and conversions.",
    postcodes: ["N1", "N5", "N19", "EC1"],
    landmarks: ["Angel", "Highbury Fields", "Upper Street"],
    propertyProfile: "Georgian and Victorian terraces",
    nearbyBoroughs: ["camden", "hackney"],
  },
  {
    slug: "kensington-and-chelsea",
    name: "Kensington and Chelsea",
    blurb:
      "Covering Kensington, Chelsea and Notting Hill, with the discretion and finish expected on the borough's higher-spec properties.",
    postcodes: ["SW3", "SW7", "W8", "W11"],
    landmarks: ["Notting Hill", "Kensington Palace", "King's Road"],
    propertyProfile: "stucco-fronted townhouses and mews properties",
    nearbyBoroughs: ["hammersmith-and-fulham", "westminster"],
  },
  {
    slug: "kingston-upon-thames",
    name: "Kingston upon Thames",
    blurb:
      "Serving Kingston town centre, Surbiton and New Malden, for homeowners and property managers across the borough.",
    postcodes: ["KT1", "KT2", "KT3", "KT5"],
    landmarks: ["Kingston town centre", "Surbiton", "Richmond Park"],
    propertyProfile: "Edwardian villas and riverside apartments",
    nearbyBoroughs: ["richmond-upon-thames", "merton"],
  },
  {
    slug: "lambeth",
    name: "Lambeth",
    blurb:
      "Covering Brixton, Clapham and Streatham, with experience across a wide mix of housing types and ages.",
    postcodes: ["SW2", "SW4", "SW9", "SE24"],
    landmarks: ["Brixton Market", "Clapham Common", "Streatham High Road"],
    propertyProfile: "Victorian terraces and converted flats",
    nearbyBoroughs: ["southwark", "wandsworth"],
  },
  {
    slug: "lewisham",
    name: "Lewisham",
    blurb:
      "Active in Lewisham, Catford and Forest Hill, working with homeowners, landlords and local managing agents.",
    postcodes: ["SE13", "SE6", "SE23", "SE4"],
    landmarks: ["Lewisham town centre", "Horniman Museum", "Forest Hill"],
    propertyProfile: "Victorian terraces and 1930s semis",
    nearbyBoroughs: ["greenwich", "southwark"],
  },
  {
    slug: "merton",
    name: "Merton",
    blurb:
      "Serving Wimbledon, Mitcham and Morden, from smaller repairs to full renovation projects.",
    postcodes: ["SW19", "SW20", "CR4", "SM4"],
    landmarks: ["Wimbledon Village", "Wimbledon Common", "Mitcham Common"],
    propertyProfile: "Edwardian villas and inter-war semis",
    nearbyBoroughs: ["wandsworth", "kingston-upon-thames"],
  },
  {
    slug: "newham",
    name: "Newham",
    blurb:
      "Covering Stratford, East Ham and Forest Gate, with plenty of experience on the borough's rapidly developing housing stock.",
    postcodes: ["E6", "E7", "E13", "E15"],
    landmarks: ["Stratford Westfield", "Queen Elizabeth Olympic Park", "East Ham"],
    propertyProfile: "Victorian terraces and new-build regeneration developments",
    nearbyBoroughs: ["tower-hamlets", "barking-and-dagenham"],
  },
  {
    slug: "redbridge",
    name: "Redbridge",
    blurb:
      "Serving Ilford, Wanstead and Woodford, for both private homeowners and local landlords.",
    postcodes: ["IG1", "IG4", "IG8", "E11"],
    landmarks: ["Ilford town centre", "Wanstead Park", "Woodford Green"],
    propertyProfile: "1930s semis and Edwardian terraces",
    nearbyBoroughs: ["newham", "havering"],
  },
  {
    slug: "richmond-upon-thames",
    name: "Richmond upon Thames",
    blurb:
      "Covering Richmond, Twickenham and Barnes, with the careful, tidy approach expected on the borough's period homes.",
    postcodes: ["TW9", "TW10", "TW1", "SW14"],
    landmarks: ["Richmond Park", "Twickenham Stadium", "Richmond riverside"],
    propertyProfile: "Georgian townhouses and riverside period homes",
    nearbyBoroughs: ["hounslow", "kingston-upon-thames"],
  },
  {
    slug: "southwark",
    name: "Southwark",
    blurb:
      "Active across Southwark, Peckham and Dulwich, working on everything from period conversions to modern flats.",
    postcodes: ["SE1", "SE15", "SE21", "SE22"],
    landmarks: ["Borough Market", "Dulwich Village", "Peckham Rye"],
    propertyProfile: "Victorian terraces and converted warehouse flats",
    nearbyBoroughs: ["lambeth", "lewisham"],
  },
  {
    slug: "sutton",
    name: "Sutton",
    blurb:
      "Serving Sutton town centre, Cheam and Wallington, for homeowners and commercial clients across the borough.",
    postcodes: ["SM1", "SM2", "SM3", "SM5"],
    landmarks: ["Sutton High Street", "Carshalton Ponds", "Cheam Village"],
    propertyProfile: "1930s semis and post-war family homes",
    nearbyBoroughs: ["croydon", "merton"],
  },
  {
    slug: "tower-hamlets",
    name: "Tower Hamlets",
    blurb:
      "Covering Bow, Bethnal Green and Canary Wharf, with experience across both period terraces and high-rise developments.",
    postcodes: ["E1", "E2", "E14", "E3"],
    landmarks: ["Canary Wharf", "Brick Lane", "Victoria Park"],
    propertyProfile: "converted warehouses and high-rise riverside developments",
    nearbyBoroughs: ["hackney", "newham"],
  },
  {
    slug: "waltham-forest",
    name: "Waltham Forest",
    blurb:
      "Serving Walthamstow, Leyton and Chingford, with a strong track record on the borough's Victorian terraces.",
    postcodes: ["E17", "E10", "E4"],
    landmarks: ["Walthamstow Village", "Epping Forest", "Lloyd Park"],
    propertyProfile: "Victorian terraces",
    nearbyBoroughs: ["hackney", "redbridge"],
  },
  {
    slug: "wandsworth",
    name: "Wandsworth",
    blurb:
      "Covering Wandsworth, Battersea and Balham, working with homeowners, landlords and managing agents throughout the borough.",
    postcodes: ["SW11", "SW12", "SW15", "SW18"],
    landmarks: ["Battersea Park", "Wandsworth Common", "Clapham Junction"],
    propertyProfile: "Victorian terraces and riverside developments",
    nearbyBoroughs: ["lambeth", "merton"],
  },
  {
    slug: "westminster",
    name: "Westminster",
    blurb:
      "Serving Marylebone, Pimlico and Fitzrovia, with the discretion and site management standards expected in central London.",
    postcodes: ["W1", "SW1", "NW8", "W2"],
    landmarks: ["Marylebone High Street", "Pimlico", "Fitzrovia"],
    propertyProfile: "Georgian townhouses and grand mansion blocks",
    nearbyBoroughs: ["camden", "kensington-and-chelsea"],
  },
  {
    slug: "city-of-london",
    name: "City of London",
    blurb:
      "Working within the Square Mile's tight access and out-of-hours requirements, for commercial premises and residential mansion blocks alike.",
    postcodes: ["EC1", "EC2", "EC3", "EC4"],
    landmarks: ["the Barbican", "Guildhall", "Smithfield Market"],
    propertyProfile: "converted commercial buildings and residential mansion blocks",
    nearbyBoroughs: ["westminster", "tower-hamlets"],
  },
];

export function getBoroughBySlug(slug: string): Borough | undefined {
  return BOROUGHS.find((borough) => borough.slug === slug);
}