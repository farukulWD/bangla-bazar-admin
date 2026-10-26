"use client";

import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";

import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import SwitchField from "@/components/form/switch-field";
import TextField from "@/components/form/text-field";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { getErrorMessage } from "@/lib/api-error";
import { pickDirty } from "@/lib/settings";
import {
  OAUTH_PROVIDERS,
  type IntegrationSettings as Integrations,
  type Settings,
  type SocialLinks,
} from "@/store/api/settings/types";

import SecretField from "./secret-field";
import {
  ResetGroupButton,
  SettingsFooter,
  SettingsLoader,
  useCanEditSettings,
  useSaveSettingsGroups,
} from "./settings-shell";

type IntegrationValues = Integrations<string | null>;

const PROVIDER_TITLES = { google: "Google", facebook: "Facebook", github: "GitHub" } as const;

const SOCIAL_LINKS: { key: keyof SocialLinks; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "X (Twitter)" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "pinterest", label: "Pinterest" },
  { key: "whatsapp", label: "WhatsApp" },
];

const withoutBlankSecrets = (patch: Record<string, unknown>) => {
  const socialLogin = patch.socialLogin as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!socialLogin) return patch;

  const providers = Object.fromEntries(
    Object.entries(socialLogin)
      .map(([provider, fields]) => {
        const { clientSecret, ...rest } = fields;
        return [provider, clientSecret === "" ? rest : fields] as const;
      })
      .filter(([, fields]) => Object.keys(fields).length > 0),
  );

  const result: Record<string, unknown> = { ...patch, socialLogin: providers };
  if (Object.keys(providers).length === 0) delete result.socialLogin;
  return result;
};

const toValues = (integrations: Integrations): IntegrationValues => ({
  ...integrations,
  socialLogin: Object.fromEntries(
    OAUTH_PROVIDERS.map((provider) => [
      provider,
      { ...integrations.socialLogin[provider], clientSecret: "" },
    ]),
  ) as IntegrationValues["socialLogin"],
});

export function IntegrationSettings() {
  return (
    <SettingsLoader>
      {(settings) => <IntegrationsForm integrations={settings.integrations} />}
    </SettingsLoader>
  );
}

function IntegrationsForm({ integrations }: { integrations: Integrations }) {
  const canEdit = useCanEditSettings();
  const { save, saving } = useSaveSettingsGroups();
  const [saved, setSaved] = useState(integrations);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<IntegrationValues>({ defaultValues: toValues(integrations) });
  const { isDirty, dirtyFields } = useFormState({ control: form.control });

  const apply = (next: Partial<Settings>) => {
    if (!next.integrations) return;
    setSaved(next.integrations);
    form.reset(toValues(next.integrations));
  };

  const onSubmit = async (values: IntegrationValues) => {
    setFormMessage(null);
    try {
      const result = await save({
        integrations: withoutBlankSecrets(
          pickDirty(values, dirtyFields),
        ),
      });
      if (result) apply(result);
    } catch (error) {
      setFormMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Store settings"
        description="Social login, analytics, live chat and social profile links."
        actions={
          canEdit && (
            <ResetGroupButton
              groups={["integrations"]}
              description="Every integration is turned off and saved IDs and secrets are erased."
              onReset={apply}
            />
          )
        }
      />

      <Form form={form} onSubmit={onSubmit} className="space-y-6">
        <FormAlert message={formMessage} />

        <fieldset disabled={!canEdit || saving} className="min-w-0">
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Social login</CardTitle>
                <CardDescription>
                  Let shoppers sign in with an existing account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {OAUTH_PROVIDERS.map((provider, index) => (
                  <div key={provider} className="space-y-4">
                    {index > 0 && <Separator />}
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-medium">{PROVIDER_TITLES[provider]}</h3>
                      <SwitchField
                        control={form.control}
                        name={`socialLogin.${provider}.enabled`}
                        label="Enabled"
                        disabled={!canEdit}
                      />
                    </div>
                    <TextField
                      control={form.control}
                      name={`socialLogin.${provider}.clientId`}
                      label="Client ID"
                      autoComplete="off"
                    />
                    <SecretField
                      control={form.control}
                      name={`socialLogin.${provider}.clientSecret`}
                      label="Client secret"
                      saved={saved.socialLogin[provider].clientSecret}
                      disabled={!canEdit}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <SwitchField
                      control={form.control}
                      name="analytics.googleAnalyticsEnabled"
                      label="Google Analytics"
                      disabled={!canEdit}
                    />
                    <TextField
                      control={form.control}
                      name="analytics.googleAnalyticsId"
                      label="Measurement ID"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <SwitchField
                      control={form.control}
                      name="analytics.fbPixelEnabled"
                      label="Meta Pixel"
                      disabled={!canEdit}
                    />
                    <TextField control={form.control} name="analytics.fbPixelId" label="Pixel ID" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live chat</CardTitle>
                  <CardDescription>Tawk.to widget on every storefront page.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-4">
                    <SwitchField
                      control={form.control}
                      name="chat.tawkEnabled"
                      label="Show chat widget"
                      disabled={!canEdit}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextField control={form.control} name="chat.tawkPropertyId" label="Property ID" />
                      <TextField control={form.control} name="chat.tawkWidgetId" label="Widget ID" />
                    </div>
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social links</CardTitle>
                  <CardDescription>Leave blank to hide a network.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="grid gap-4 md:grid-cols-2">
                    {SOCIAL_LINKS.map(({ key, label }) => (
                      <TextField
                        key={key}
                        control={form.control}
                        name={`social.${key}`}
                        label={label}
                        placeholder="https://"
                      />
                    ))}
                  </FieldGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        </fieldset>

        {canEdit && (
          <SettingsFooter
            pending={saving}
            dirty={isDirty}
            onDiscard={() => form.reset()}
          />
        )}
      </Form>
    </div>
  );
}
