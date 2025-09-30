// Company logo component
export function CompanyLogo({
  company,
  width = '120px',
}: {
  company: string;
  width?: string;
}) {
  const logoStyle = {
    width: width,
    display: 'inline-block',
    objectFit: 'contain' as const,
    borderRadius: '6px',
    marginBottom: '10px',
  };

  const logos: Record<string, React.ReactElement> = {
    google: (
      <img
        src='/assets/images/companies/google.svg'
        alt='Google'
        style={logoStyle}
      />
    ),
    microsoft: (
      <img
        src='/assets/images/companies/microsoft.png'
        alt='Microsoft'
        style={logoStyle}
      />
    ),
    salesforce: (
      <img
        src='/assets/images/companies/salesforce.svg'
        alt='Salesforce'
        style={logoStyle}
      />
    ),
    ycombinator: (
      <img
        src='/assets/images/companies/ycombinator.svg'
        alt='Y Combinator'
        style={logoStyle}
      />
    ),
    umd: (
      <img
        // src='/assets/images/companies/umd.svg'
        src='https://eng.umd.edu/sites/clark.umd.edu/themes/clark/assets/images/logo.svg'
        alt='University of Maryland'
        style={logoStyle}
        width='200px'
      />
    ),
    idm: (
      <img
        src='/assets/images/companies/idm.jpg'
        alt='Gates Foundation'
        style={logoStyle}
      />
    ),
    tmobile: (
      <img
        src='/assets/images/companies/tmobile.jpeg'
        alt='T-Mobile'
        style={logoStyle}
      />
    ),
    tableau: (
      <img
        src='/assets/images/companies/tableau.svg'
        alt='Tableau'
        style={logoStyle}
      />
    ),
    jobbatical: (
      <img
        src='/assets/images/companies/jobbatical.png'
        alt='Jobbatical'
        style={logoStyle}
      />
    ),
    treasure: (
      <img
        src='/assets/images/companies/treasure.webp'
        alt='Treasure Technologies'
        style={logoStyle}
      />
    ),
    'compass-technologies': (
      <img
        src='/assets/images/companies/compass-technologies.png'
        alt='Compass Technologies'
        style={logoStyle}
      />
    ),
    fullstack: (
      <img
        src='/assets/images/companies/fullstack-consulting.jpeg'
        alt='Fullstack Consulting'
        style={logoStyle}
      />
    ),
    'bluehippo-funding': (
      <img
        src='/assets/images/companies/bluehippo-funding.png'
        alt='Blue Hippo Funding'
        style={logoStyle}
      />
    ),
    'meds-publishing': (
      <img
        src='/assets/images/companies/meds-publishing.png'
        alt='Meds Publishing'
        style={logoStyle}
      />
    ),
    theglobalist: (
      <img
        src='/assets/images/companies/theglobalist.jpg'
        alt='The Globalist'
        style={logoStyle}
      />
    ),
    'gemini-code-assist': (
      <img
        src='/assets/images/companies/gemini-code-assist.png'
        alt='Gemini'
        style={logoStyle}
      />
    ),
    roomtoday: (
      <img
        src='/assets/images/companies/room-today.png'
        alt='RoomToday'
        style={logoStyle}
      />
    ),
    'wdc-3': (
      <img
        src='/assets/images/companies/wdc-3.png'
        alt='WDC-3'
        style={logoStyle}
      />
    ),
    plutonic: (
      <div
        style={{
          ...logoStyle,
          width: '120px',
          height: '120px',
          backgroundColor: '#6366f1',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Plutonic
      </div>
    ),
    'videoly platform': (
      <div
        style={{
          ...logoStyle,
          width: '120px',
          height: '120px',
          backgroundColor: '#ff6b6b',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Videoly
      </div>
    ),
    'roomtoday platform': (
      <img
        src='/assets/images/companies/room-today.png'
        alt='RoomToday Platform'
        style={logoStyle}
      />
    ),
  };

  const logo = logos[company.toLowerCase()];
  if (!logo) return null;

  return logo;
}
