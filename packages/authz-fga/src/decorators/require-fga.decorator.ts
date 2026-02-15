import { SetMetadata } from '@nestjs/common';

type ObjectIdResolver = (request: unknown) => string | null | undefined;

export type FgaRequirement = {
  objectType: string;
  objectId: string | ObjectIdResolver;
  relation: string;
};

export const FGA_REQUIRE_KEY = 'fga:require';

export const RequireFga = (
  objectType: string,
  objectId: string | ObjectIdResolver,
  relation: string
) => SetMetadata(FGA_REQUIRE_KEY, { objectType, objectId, relation });
