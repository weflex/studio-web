import provinces from '../../../china-division/provinces.json';
import cities from '../../../china-division/cities.json';
import areas from '../../../china-division/areas.json';

areas.forEach((area) => {
  const matchCity = cities.filter(city => city.code === area.parent_code)[0];
  if (matchCity) {
    matchCity.children = matchCity.children || [];
    matchCity.children.push({
      label: area.name,
      value: area.code,
    });
  }
});

cities.forEach((city) => {
  const matchProvince = provinces.filter(province => province.code === city.parent_code)[0];
  if (matchProvince) {
    matchProvince.children = matchProvince.children || [];
    matchProvince.children.push({
      label: city.name,
      value: city.code,
      children: city.children,
    });
  }
});

const options = provinces.map(province => ({
  label: province.name,
  value: province.code,
  children: province.children,
}));

export default options;