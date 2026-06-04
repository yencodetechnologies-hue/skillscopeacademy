import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../services/courseService'

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  })
}
