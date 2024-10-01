'use client';
import Banner from '@/components/shared/main/profile/settings/Profile';
import Information from '@/components/shared/main/profile/settings/Info';
import Password from '@/components/shared/main/profile/settings/Password';
import Social from '@/components/shared/main/profile/settings/Socials';

const ProfileSetting = () => {
  return (
    <div className="mt-3 grid h-full w-full grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="rounded-[20px]">
        <div>
          <Banner />
        </div>
        <div className="mt-3">
          <Information />
        </div>
      </div>
      <div className="">
        <div>
          <Social />
        </div>
        <div>
          <Password />
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;
