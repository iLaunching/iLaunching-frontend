import * as solidIcons from '@fortawesome/free-solid-svg-icons';

console.log('Testing icon lookups:');
console.log('faTruckMoving:', !!solidIcons.faTruckMoving);
console.log('faSyncAlt:', !!solidIcons.faSyncAlt);
console.log('faAlignJustify:', !!solidIcons.faAlignJustify);
console.log('faUser:', !!solidIcons.faUser);
console.log('faHeart:', !!solidIcons.faHeart);
console.log('fa0:', !!solidIcons.fa0);
console.log('fa1:', !!solidIcons.fa1);

// List all available icons starting with "faSync"
console.log('\nIcons starting with "faSync":');
Object.keys(solidIcons).filter(key => key.startsWith('faSync')).forEach(key => {
  console.log(' -', key);
});

console.log('\nIcons starting with "faTruck":');
Object.keys(solidIcons).filter(key => key.startsWith('faTruck')).forEach(key => {
  console.log(' -', key);
});
