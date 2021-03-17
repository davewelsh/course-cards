import * as HttpStatus from '@qccareerschool/http-status';
import * as yup from 'yup';

import { asyncWrapper } from '../lib/asyncWrapper';
import { courseCard } from '../courseCard';

type CourseCardRequest = {
  courseCode: string;
  countryCode: string;
  provinceCode?: string;
};

const courseRequestSchema: yup.SchemaOf<CourseCardRequest> = yup.object({
  courseCode: yup.string().length(2).required(),
  countryCode: yup.string().length(2).required(),
  provinceCode: yup.string().min(1).max(3),
}).required();

export const coursesHandler = asyncWrapper(async (req, res) => {
  let courseResult: CourseCardRequest;
  try {
    courseResult = await courseRequestSchema.validate(req.query);
  } catch (err) {
    throw new HttpStatus.BadRequest(err);
  }
  res.send(await courseCard(courseResult.courseCode, courseResult.countryCode, courseResult.provinceCode));
});
