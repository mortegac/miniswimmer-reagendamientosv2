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
              sessionDetails(filter: { status: { eq: ACTIVE } }, limit: 1000) {
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
      }
    }
  }
`;
