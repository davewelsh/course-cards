import * as HttpStatus from '@qccareerschool/http-status';
import { audCountry, gbpCountry, nzdCountry } from '@qccareerschool/helper-functions';
import { PoolConnection } from 'promise-mysql';
import { pool } from './pool';

type CourseCardResult = {
  name: string;
  cost: number;
  currency: {
    symbol: string;
    name: string;
    code: string;
  };
};

export const courseCard = async (courseCode: string, countryCode: string, provinceCode?: string): Promise<CourseCardResult> => {
  const courseRow = await getCourseRow(courseCode, countryCode, provinceCode);
  if (courseRow === false) {
    throw new HttpStatus.NotFound('Unable to find course/location combination');
  }

  return {
    name: courseRow.courseName,
    cost: courseRow.cost,
    currency: {
      symbol: courseRow.currencySymbol,
      name: courseRow.currencyName,
      code: courseRow.currencyCode,
    },
  };
};

type CourseRow = {
  courseName: string;
  currencyCode: string;
  currencySymbol: string;
  currencyName: string;
  cost: number;
}

const getCourseRow = async (courseCode: string, countryCode: string, provinceCode?: string): Promise<CourseRow | false> => {
  const connection = await (await pool).getConnection();
  try {
    return provinceCode && await getCourseRowByCountryAndProvince(connection, courseCode, countryCode, provinceCode)
      || await getCourseRowByCountry(connection, courseCode, countryCode)
      || await getCourseRowByRegion(connection, courseCode, countryCode)
      || await getCourseRowDefault(connection, courseCode);
  } finally {
    connection.release();
  }
};

const getCourseRowByCountryAndProvince = async (connection: PoolConnection, courseCode: string, countryCode: string, provinceCode: string): Promise<CourseRow | false> => {
  const sql = `
SELECT courses.name courseName, currencies.code currencyCode, currencies.symbol currencySymbol, currencies.code currencyCode, prices.cost
FROM courses
LEFT JOIN prices ON prices.course_code = courses.code
LEFT JOIN currencies ON currencies.code = prices.currency_code
WHERE
  courses.code = ?
    AND
  prices.country_code = ?
    AND
  prices.province_code = ?`;
  const rows = await connection.query(sql, [ courseCode, countryCode, provinceCode ]);
  return rows?.[0] ?? false;
};

const getCourseRowByCountry = async (connection: PoolConnection, courseCode: string, countryCode: string): Promise<CourseRow | false> => {
  const sql = `
SELECT courses.name courseName, currencies.code currencyCode, currencies.symbol currencySymbol, currencies.code currencyCode, prices.cost
FROM courses
LEFT JOIN prices ON prices.course_code = courses.code
LEFT JOIN currencies ON currencies.code = prices.currency_code
WHERE
  courses.code = ?
    AND
  prices.country_code = ?
    AND
  prices.province_code IS NULL`;
  const rows = await connection.query(sql, [ courseCode, countryCode ]);
  return rows?.[0] ?? false;
};

const getCourseRowByRegion = async (connection: PoolConnection, courseCode: string, countryCode: string): Promise<CourseRow | false> => {
  const sql = `
  SELECT courses.name courseName, currencies.code currencyCode, currencies.symbol currencySymbol, currencies.code currencyCode, prices.cost
FROM courses
LEFT JOIN prices ON prices.course_code = courses.code
LEFT JOIN currencies ON currencies.code = prices.currency_code
WHERE
  courses.code = ?
    AND
  prices.country_code = ?
    AND
  prices.province_code IS NULL`;
  const effectiveCountry = gbpCountry(countryCode) ? 'GB' : audCountry(countryCode) ? 'AU' : nzdCountry(countryCode) ? 'NZ' : null;
  if (effectiveCountry === null) {
    return false;
  }
  const rows = await connection.query(sql, [ courseCode, effectiveCountry ]);
  return rows?.[0] ?? false;
};

const getCourseRowDefault = async (connection: PoolConnection, courseCode: string): Promise<CourseRow | false> => {
  const sql = `
  SELECT courses.name courseName, currencies.code currencyCode, currencies.symbol currencySymbol, currencies.code currencyCode, prices.cost
FROM courses
LEFT JOIN prices ON prices.course_code = courses.code
LEFT JOIN currencies ON currencies.code = prices.currency_code
WHERE
  courses.code = ?
    AND
  prices.country_code IS NULL`;
  const rows = await connection.query(sql, [ courseCode ]);
  return rows?.[0] ?? false;
};
