type CourseCardResult = {
  name: string;
  currency: {
    symbol: string;
    name: string;
    code: string;
  };
  price: number;
};

export const courseCard = async (courseCode: string, countryCode: string, provinceCode?: string): Promise<CourseCardResult> => {
  return {
    name: 'Master Makeup Artistry',
    currency: {
      symbol: '$',
      name: 'US dollars',
      code: 'USD',
    },
    price: 1549,
  };
};
