export const createParentsAuthorization = /* GraphQL */ `
  mutation CreateV2ParentsAuthorization($input: CreateV2ParentsAuthorizationInput!) {
    createV2ParentsAuthorization(input: $input) {
      id
      code
      status
      userId
      createdAt
    }
  }
`;

export const updateParentsAuthorization = /* GraphQL */ `
  mutation UpdateV2ParentsAuthorization($input: UpdateV2ParentsAuthorizationInput!) {
    updateV2ParentsAuthorization(input: $input) {
      id
      code
      status
      updatedAt
    }
  }
`;

export const updateSessionDetail = /* GraphQL */ `
  mutation UpdateV2SessionDetail($input: UpdateV2SessionDetailInput!) {
    updateV2SessionDetail(input: $input) {
      id
      date
      status
      courseId
      scheduleId
      locationId
    }
  }
`;
