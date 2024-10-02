import { IMusic } from "../../../../infrastructure/database/models/musicModal";
import MusicRepository from "../../../repositories/admin/musicRepository";

export default class GetCreatePostMusicData {
  private musicRepository: MusicRepository;

  constructor(musicRepository: MusicRepository) {
    this.musicRepository = musicRepository;
  }

  public async execute(search: any): Promise<{}> {
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        title: { $regex: searchRegex },
      };
    }
    const allMusic = this.musicRepository.find10Music(query);
    return allMusic;
  }
}
