import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import clsx from 'clsx';
import loadDynamic from 'next/dynamic';
import { TestimonialComponent } from '@gitroom/frontend/components/auth/testimonial.component';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { Toaster } from '@gitroom/react/toaster/toaster';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();
  // a white-labeled app shows its own logo and no Postiz marketing
  const branded = !!process.env.BRAND_NAME;

  return (
    <MantineWrapper>
      <Toaster />
      <div className="bg-[#0E0E0E] flex flex-1 p-[12px] gap-[12px] min-h-screen w-screen text-white">
        {/*<style>{`html, body {overflow-x: hidden;}`}</style>*/}
        <ReturnUrlComponent />
        <div
          className={clsx(
            'flex flex-col py-[40px] px-[20px] flex-1 rounded-[12px] text-white p-[12px] bg-[#1A1919]',
            !branded && 'lg:w-[600px] lg:flex-none'
          )}
        >
          <div className="w-full max-w-[440px] mx-auto justify-center gap-[20px] h-full flex flex-col text-white">
            {branded ? (
              <div className="flex items-center gap-[12px]">
                {!!process.env.BRAND_LOGO_URL && (
                  <img
                    src={process.env.BRAND_LOGO_URL}
                    alt={process.env.BRAND_NAME}
                    className="h-[40px] w-[40px] object-contain"
                  />
                )}
                <div className="text-[24px] font-[600]">
                  {process.env.BRAND_NAME}
                </div>
              </div>
            ) : (
              <LogoTextComponent />
            )}
            <div className="flex">{children}</div>
          </div>
        </div>
        {!branded && (
          <div className="text-[36px] flex-1 pt-[88px] hidden lg:flex flex-col items-center">
            <div className="text-center">
              Over <span className="text-[42px] text-[#FC69FF]">20,000+</span>{' '}
              Entrepreneurs use
              <br />
              Postiz To Grow Their Social Presence
            </div>
            <TestimonialComponent />
          </div>
        )}
      </div>
    </MantineWrapper>
  );
}
