
    export type RemoteKeys = 'chattea_web/CommunityApp';
    type PackageType<T> = T extends 'chattea_web/CommunityApp' ? typeof import('chattea_web/CommunityApp') :any;