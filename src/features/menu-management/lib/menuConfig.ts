export const menuTypeCode = {
  internal: 1,
  external: 2,
} as const;

export const openModeCode = {
  iframe: 1,
  new_tab: 2,
} as const;

export const authenticationModeCode = {
  none: 1,
  oidc: 2,
  token_handoff: 3,
} as const;

export function mapMenuTypeFromApi(value: number | null | undefined): 'internal' | 'external' {
  return value === menuTypeCode.external ? 'external' : 'internal';
}

export function mapOpenModeFromApi(value: number | null | undefined): 'iframe' | 'new_tab' {
  return value === openModeCode.new_tab ? 'new_tab' : 'iframe';
}

export function mapAuthenticationModeFromApi(
  value: number | null | undefined,
): 'none' | 'oidc' | 'token_handoff' {
  switch (value) {
    case 2:
      return 'oidc';
    case 3:
      return 'token_handoff';
    default:
      return 'none';
  }
}

export function mapMenuTypeToApi(value: 'internal' | 'external'): number {
  return value === 'external' ? menuTypeCode.external : menuTypeCode.internal;
}

export function mapOpenModeToApi(value: 'iframe' | 'new_tab'): number {
  return value === 'new_tab' ? openModeCode.new_tab : openModeCode.iframe;
}

export function mapAuthenticationModeToApi(
  value: 'none' | 'oidc' | 'token_handoff',
): number {
  switch (value) {
    case 'oidc':
      return authenticationModeCode.oidc;
    case 'token_handoff':
      return authenticationModeCode.token_handoff;
    default:
      return authenticationModeCode.none;
  }
}
