export type Dog = {
  id: string;
  name: string;
  photoUrl: string | null;
};

export type Caretaker = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type WalkRecord = {
  id: string;
  walkedAt: string;
};

export type Enclosure = {
  id: string;
  name: string;
  photoUrl: string | null;
  groupName: string | null;
  comment: string | null;
  caretakerId: string | null;
  caretaker: Caretaker | null;
  dogs: Dog[];
  walks: WalkRecord[];
};
