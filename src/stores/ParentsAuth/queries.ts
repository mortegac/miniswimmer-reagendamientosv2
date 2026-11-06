export const getParentUser = /* GraphQL */ `
  query GetV2Users($id: ID!) {
    getV2Users(id: $id) {
      id
      name
      email
      roleId
      isActive
    }
  }
`;

export const parentsAuthorizationsByCode = /* GraphQL */ `
  query ParentsAuthorizationsByCode(
    $code: String!
    $filter: Modelv2ParentsAuthorizationFilterInput
  ) {
    parentsAuthorizationsByCode(code: $code, filter: $filter) {
      items {
        id
        code
        status
        userId
        createdAt
        updatedAt
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const relationshipsByUserId = /* GraphQL */ `
  query RelationshipsByUserId($userId: ID!, $limit: Int) {
    relationshipsByUserId(userId: $userId, limit: $limit) {
      items {
        id
        relationType
        studentId
        student {
          id
          name
          lastName
          birthdate
          gender
          isActive
          enrollments {
            items {
              id
              wasPaid
              scheduleName
              numberOfSessions
              sessionsLeft
              startDate
              endDate
              courseId
              course {
                id
                title
                description
              }
              sessionDetails(filter: { or: [{ status: { eq: ACTIVE } }, { status: { eq: RECOVERED } }] }, limit: 1000) {
                items {
                  id
                  date
                  day
                  month
                  year
                  sessionNumber
                  totalSessions
                  status
                  locationId
                  courseId
                  scheduleId
                  course {
                    id
                    title
                  }
                  schedule {
                    id
                    day
                    startHour
                    endHour
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const listLocations = /* GraphQL */ `
  query ListV2Locations($limit: Int) {
    listV2Locations(limit: $limit) {
      items {
        id
        name
        city
        address
        group
        isActive
        isVisible
      }
    }
  }
`;

export const coursesByLocation = /* GraphQL */ `
  query ListV2Courses($filter: ModelV2CourseFilterInput, $limit: Int) {
    listV2Courses(filter: $filter, limit: $limit) {
      items {
        id
        title
        description
        isActive
        locationId
      }
    }
  }
`;

export const schedulesByCourse = /* GraphQL */ `
  query SchedulesByCourse($courseSchedulesId: ID!, $limit: Int) {
    schedulesByCourse(courseSchedulesId: $courseSchedulesId, limit: $limit) {
      items {
        id
        day
        startHour
        endHour
        isActive
        locationSchedulesId
        courseSchedulesId
      }
    }
  }
`;
