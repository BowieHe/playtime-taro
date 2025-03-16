import { User } from "@/types/user";
import { observable } from "mobx";

export interface UserStore {
  user: User;
  setUser(user: User): void;
  setWechatId(openId: string, unionId: string): void;
  setOpenId(openId: string): void;
  setUnionId(unionId: string): void;
  getUser(): User;
}

const userStore = observable<UserStore>({
  user: {
    nickName: "",
    avatarUrl: "",
    phoneNumber: "",
    openId: "",
    unionId: "",
  },

  setUser(user: User) {
    this.user = user;
  },

  setWechatId(openId: string, unionId: string) {
    this.user.openId = openId;
    this.user.unionId = unionId;
  },
  setOpenId(openId: string) {
    this.user.openId = openId;
  },

  setUnionId(unionId: string) {
    this.user.unionId = unionId;
  },

  getUser() {
    return this.user;
  },
});

export default userStore;
