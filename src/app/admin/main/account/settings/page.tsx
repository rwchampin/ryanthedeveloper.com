import Information from '@/components/shared/main/account/settings/Information';
import Connect from '@/components/shared/main/account/settings/Connected';
import Delete from '@/components/shared/main/account/settings/Delete';
import NewsLetter from '@/components/shared/main/account/settings/Newsletter';
import Password from '@/components/shared/main/account/settings/Password';
import Profile from '@/components/shared/main/account/settings/Profile';
import Session from '@/components/shared/main/account/settings/Sessions';
import Social from '@/components/shared/main/account/settings/Socials';
import TwoFactor from '@/components/shared/main/account/settings/TwoFactor';

const Setting = () => {
  return (
    <div className="mt-3 grid h-full w-full grid-cols-1 gap-5 rounded-[20px] lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <Profile />
        <Information />
        <Social />
        <Password />
      </div>

      <div className="flex flex-col gap-5">
        <TwoFactor />
        <NewsLetter />
        <Session />
        <Connect />
        <Delete />
      </div>
    </div>
  );
};

export default Setting;
