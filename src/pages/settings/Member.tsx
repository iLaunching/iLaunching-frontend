export default function Member() {
  return (
    <div 
      style={{
        width: '80%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Work Sans, sans-serif',
        backgroundColor:'#d6d6d6',
        justifySelf: 'center',
        paddingTop: '60px'
      }}
    >
      {/* Title */}
      <h1 
        style={{
          fontSize: '18px',
          fontWeight: 500,
          marginBottom: '32px',
          fontFamily: 'Work Sans, sans-serif'
        }}
      >
        Member Settings
      </h1>

      {/* General Section */}
      <div 
        style={{
          marginBottom: '32px',
          fontFamily: 'Work Sans, sans-serif'
        }}
      >
        <h2 
          style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '16px',
            fontFamily: 'Work Sans, sans-serif'
          }}
        >
          Profile
        </h2>
        <div 
          style={{
            padding: '16px',
            fontFamily: 'Work Sans, sans-serif'
          }}
        >
          {/* Profile content */}
        </div>
      </div>

      {/* Preferences Section */}
      <div 
        style={{
          marginBottom: '32px',
          fontFamily: 'Work Sans, sans-serif'
        }}
      >
        <h2 
          style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '16px',
            fontFamily: 'Work Sans, sans-serif'
          }}
        >
          Preferences
        </h2>
        <div 
          style={{
            padding: '16px',
            fontFamily: 'Work Sans, sans-serif'
          }}
        >
          {/* Preferences content */}
        </div>
      </div>
    </div>
  );
}
