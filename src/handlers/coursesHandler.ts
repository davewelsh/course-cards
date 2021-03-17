import * as HttpStatus from '@qccareerschool/http-status';
import * as yup from 'yup';

import { asyncWrapper } from '../lib/asyncWrapper';
import { courseCard } from '../courseCard';

type CourseCardRequest = {
  countryCode: string;
  provinceCode?: string;
  courseCode: string;
}

const courseRequestSchema = yup.object<CourseCardRequest>({
  countryCode: yup.string().required(),
  provinceCode: yup.string().length(2),
  courseCode: yup.string().length(2).required(),
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
